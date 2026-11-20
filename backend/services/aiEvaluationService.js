const db = require('../config/db');

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 15000;

const fetchWithTimeout = async (url, options, timeoutMs = AI_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            const timeoutErr = new Error(`Yêu cầu chấm điểm AI vượt quá thời gian chờ (${timeoutMs / 1000}s)`);
            timeoutErr.code = 'AI_TIMEOUT';
            throw timeoutErr;
        }
        const networkErr = new Error(`Không thể kết nối tới dịch vụ AI: ${error.message}`);
        networkErr.code = 'AI_NETWORK_ERROR';
        throw networkErr;
    } finally {
        clearTimeout(timeoutId);
    }
};

const evaluateWithAI = async (positionName, level, qaList, simulateError = false) => {
    if (simulateError) {
        const simErr = new Error('Dịch vụ AI tạm thời gián đoạn hoặc quá thời gian phản hồi (Simulated Timeout)');
        simErr.code = 'AI_TIMEOUT';
        throw simErr;
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
        const prompt = `Bạn là chuyên gia phỏng vấn kỹ thuật cho vị trí ${positionName} (${level}).
Hãy đánh giá danh sách câu hỏi và câu trả lời của ứng viên dưới đây:
${JSON.stringify(qaList, null, 2)}

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

        const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const apiErr = new Error(`LLM trả về mã lỗi HTTP ${response.status}`);
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

        const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        return JSON.parse(cleanJson);
    }

    const answeredCount = qaList.filter(item => item.answer_text && item.answer_text.trim().length > 0).length;
    const avgLength = answeredCount > 0
        ? qaList.reduce((sum, item) => sum + (item.answer_text ? item.answer_text.trim().length : 0), 0) / qaList.length
        : 0;

    let baseScore = 5.0;
    if (answeredCount === 0) baseScore = 2.0;
    else if (avgLength > 80) baseScore = 8.5;
    else if (avgLength > 30) baseScore = 7.5;
    else baseScore = 6.5;

    return {
        overall_score: Number(baseScore.toFixed(1)),
        summary_feedback: `Ứng viên đã hoàn thành ${answeredCount}/${qaList.length} câu hỏi cho vị trí ${positionName} (${level}). Câu trả lời bám sát trọng tâm kỹ thuật.`,
        details: [
            {
                criterion_name: 'Kiến thức chuyên môn',
                score: Number(baseScore.toFixed(1)),
                strength: 'Nắm được các khái niệm cốt lõi của câu hỏi.',
                weakness: 'Một số ý giải thích còn ngắn gọn.',
                suggestion: 'Bổ sung thêm ví dụ thực tế khi trình bày.'
            },
            {
                criterion_name: 'Mức độ hoàn thiện',
                score: Number(Math.min(10, baseScore + 0.5).toFixed(1)),
                strength: 'Trả lời đúng trọng tâm câu hỏi đặt ra.',
                weakness: 'Chưa đào sâu các trường hợp biên (edge cases).',
                suggestion: 'Phân tích thêm ưu và nhược điểm của từng giải pháp.'
            }
        ]
    };
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