async function generateInterviewQuestions(positionName, level, count) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

    if (!apiKey) {
        throw new Error('Thiếu GEMINI_API_KEY trong backend/.env');
    }

    const prompt = `Tạo đúng ${count} câu hỏi phỏng vấn kỹ thuật bằng tiếng Việt.
Vị trí: ${positionName}. Cấp độ: ${level}.
Các câu hỏi phải khác nhau và phù hợp với cấp độ.
Chỉ trả về JSON theo cấu trúc:
{"questions":[{"content":"Câu hỏi","sample_answer":"Đáp án mẫu"}]}`;

    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5
            }),
            signal: AbortSignal.timeout(Number(process.env.AI_TIMEOUT_MS) || 15000)
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini trả về mã HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() || '';
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const { questions } = JSON.parse(jsonText);

    if (!Array.isArray(questions) || questions.length !== count) {
        throw new Error(`Gemini phải trả về đúng ${count} câu hỏi`);
    }

    const result = questions.map((question) => ({
        content: question?.content?.trim(),
        sample_answer: question?.sample_answer?.trim()
    }));

    const uniqueQuestions = new Set(result.map((question) => question.content?.toLowerCase()));

    if (result.some((question) => !question.content || !question.sample_answer)
        || uniqueQuestions.size !== count) {
        throw new Error('Gemini trả về câu hỏi trùng hoặc thiếu nội dung');
    }

    return result;
}

module.exports = { generateInterviewQuestions };