const db = require('../config/db');

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 15000;

const fetchWithTimeout = async (url, options, timeoutMs = AI_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            const timeoutErr = new Error(
                `Yêu cầu chấm điểm AI vượt quá thời gian chờ (${timeoutMs / 1000}s)`
            );
            timeoutErr.code = 'AI_TIMEOUT';
            throw timeoutErr;
        }

        const networkErr = new Error(
            `Không thể kết nối tới dịch vụ AI: ${error.message}`
        );
        networkErr.code = 'AI_NETWORK_ERROR';
        throw networkErr;
    } finally {
        clearTimeout(timeoutId);
    }
};

const evaluateWithAI = async (positionName, level, qaList, simulateError = false) => {
    if (simulateError) {
        const simErr = new Error(
            'Dịch vụ AI tạm thời gián đoạn hoặc quá thời gian phản hồi (Simulated Timeout)'
        );
        simErr.code = 'AI_TIMEOUT';
        throw simErr;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
        const error = new Error(
            'Chưa cấu hình GEMINI_API_KEY. Không thể chấm điểm bằng AI.'
        );
        error.code = 'AI_CONFIG_ERROR';
        throw error;
    }

    if (apiKey) {
        const prompt = `Bạn là chuyên gia phỏng vấn kỹ thuật cho vị trí ${positionName} (${level}).
Hãy đánh giá danh sách câu hỏi và câu trả lời của ứng viên dưới đây:
${JSON.stringify(qaList, null, 2)}

Quy tắc chấm:
- Chấm dựa trên độ đúng và mức liên quan của câu trả lời. Độ dài không tự làm tăng điểm.
- Câu trả lời vô nghĩa, lạc đề, trống hoặc chỉ gồm ký tự ngẫu nhiên được 0 điểm cho câu đó.
- Nếu tất cả câu trả lời thuộc các trường hợp trên, overall_score và score của từng tiêu chí phải bằng 0.
- Nhận xét phải dựa trên nội dung thực tế. Nếu chưa có điểm mạnh, ghi rõ chưa thể hiện điểm mạnh.
- Dùng thang điểm từ 0 đến 10.

Trả về DUY NHẤT một chuỗi JSON hợp lệ (không bọc markdown) theo đúng cấu trúc:
{
  "overall_score": 8.0,
  "summary_feedback": "Nhận xét tổng quan ngắn gọn",
  "details": [
    {
      "criterion_name": "Kiến thức chuyên môn",
      "score": 8.0,
      "strength": "Điểm mạnh",
      "weakness": "Điểm yếu",
      "suggestion": "Gợi ý cải thiện"
    },
    {
      "criterion_name": "Tư duy giải quyết vấn đề",
      "score": 8.0,
      "strength": "Điểm mạnh",
      "weakness": "Điểm yếu",
      "suggestion": "Gợi ý cải thiện"
    }
  ]
}`;

        const response = await fetchWithTimeout(
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model: process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3
                })
            }
        );

        if (!response.ok) {
            const apiErr = new Error(
                `Gemini trả về mã lỗi HTTP ${response.status}`
            );
            apiErr.code = 'AI_PROVIDER_ERROR';
            throw apiErr;
        }

        const data = await response.json();
        const rawText = data?.choices?.[0]?.message?.content?.trim();

        if (!rawText) {
            const parseErr = new Error('Phản hồi từ AI rỗng hoặc sai định dạng');
            parseErr.code = 'AI_INVALID_RESPONSE';
            throw parseErr;
        }

        const cleanJson = rawText
            .replace(/^```json\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        let result;

        try {
            result = JSON.parse(cleanJson);
        } catch (error) {
            const parseError = new Error(
                'Gemini trả về JSON không hợp lệ'
            );
            parseError.code = 'AI_INVALID_RESPONSE';
            throw parseError;
        }

        if (
            !result ||
            typeof result.overall_score !== 'number' ||
            !Number.isFinite(result.overall_score) ||
            result.overall_score < 0 ||
            result.overall_score > 10 ||
            typeof result.summary_feedback !== 'string' ||
            !Array.isArray(result.details) ||
            result.details.length === 0 ||
            !result.details.every(item =>
                item &&
                typeof item.criterion_name === 'string' &&
                item.criterion_name.trim().length > 0 &&
                typeof item.score === 'number' &&
                Number.isFinite(item.score) &&
                item.score >= 0 &&
                item.score <= 10
            )
        ) {
            const validationError = new Error(
                'Dữ liệu chấm điểm Gemini không hợp lệ'
            );
            validationError.code = 'AI_INVALID_RESPONSE';
            throw validationError;
        }

        return result;

    }

};

const evaluateAndSaveSession = async (sessionId, options = {}) => {
    const [sessionRows] = await db.query(
        `SELECT s.id, jp.name AS position_name, jp.level
         FROM interview_sessions s
         INNER JOIN job_positions jp ON s.position_id = jp.id
         WHERE s.id = ?`,
        [sessionId]
    );

    if (sessionRows.length === 0) {
        throw new Error('Không tìm thấy thông tin phiên phỏng vấn để chấm điểm');
    }

    const { position_name, level } = sessionRows[0];

    const [qaList] = await db.query(
        `SELECT sq.order_no, q.content AS question, a.answer_text
         FROM session_questions sq
         INNER JOIN questions q ON sq.question_id = q.id
         LEFT JOIN answers a ON a.session_question_id = sq.id AND a.session_id = sq.session_id
         WHERE sq.session_id = ?
         ORDER BY sq.order_no ASC`,
        [sessionId]
    );

    const evaluationResult = await evaluateWithAI(
        position_name,
        level,
        qaList,
        Boolean(options.simulateError)
    );

    await db.query('DELETE FROM evaluations WHERE session_id = ?', [sessionId]);

    for (const item of evaluationResult.details) {
        await db.query(
            `INSERT INTO evaluations (session_id, criterion_name, score, strength, weakness, suggestion)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                sessionId,
                item.criterion_name,
                item.score,
                item.strength || null,
                item.weakness || null,
                item.suggestion || null
            ]
        );
    }

    await db.query(
        `INSERT INTO session_results (session_id, overall_score, summary_feedback)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            overall_score = VALUES(overall_score),
            summary_feedback = VALUES(summary_feedback),
            evaluated_at = CURRENT_TIMESTAMP`,
        [sessionId, evaluationResult.overall_score, evaluationResult.summary_feedback]
    );

    await db.query(
        'UPDATE interview_sessions SET status = ? WHERE id = ?',
        ['COMPLETED', sessionId]
    );

    return evaluationResult;
};

module.exports = {
    evaluateAndSaveSession
};