const db = require('../config/db');

// POST /api/v1/sessions
const createSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { position_id, total_questions } = req.body;

        if (!position_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn vị trí ứng tuyển (position_id)'
            });
        }

        const [positions] = await db.query(
            'SELECT id, name, level FROM job_positions WHERE id = ? AND is_active = TRUE',
            [position_id]
        );

        if (positions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vị trí ứng tuyển không tồn tại hoặc đã ngừng hỗ trợ'
            });
        }

        const numQuestions = total_questions || 3;
        const initialStatus = 'IN_PROGRESS';

        const [result] = await db.query(
            'INSERT INTO interview_sessions (user_id, position_id, status, total_questions) VALUES (?, ?, ?, ?)',
            [userId, position_id, initialStatus, numQuestions]
        );

        const sessionId = result.insertId;

        const [availableQuestions] = await db.query(
            'SELECT id FROM questions WHERE position_id = ? AND is_active = TRUE ORDER BY RAND() LIMIT ?',
            [position_id, Number(numQuestions)]
        );

        for (let i = 0; i < availableQuestions.length; i++) {
            await db.query(
                'INSERT INTO session_questions (session_id, question_id, order_no) VALUES (?, ?, ?)',
                [sessionId, availableQuestions[i].id, i + 1]
            );
        }

        return res.status(201).json({
            status: 'success',
            message: 'Khởi tạo phiên phỏng vấn thành công',
            data: {
                sessionId,
                userId,
                position: positions[0],
                status: initialStatus,
                total_questions: availableQuestions.length
            }
        });
    } catch (error) {
        console.error('Lỗi API createSession:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi tạo phiên phỏng vấn',
            error: error.message
        });
    }
};

// GET /api/v1/sessions/:id/questions
const getSessionQuestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        const [sessions] = await db.query(
            'SELECT id, position_id, status, total_questions FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy phiên phỏng vấn hoặc bạn không có quyền truy cập'
            });
        }

        const [questions] = await db.query(
            `SELECT 
                sq.id AS session_question_id,
                sq.order_no,
                q.id AS question_id,
                q.content,
                q.difficulty
            FROM session_questions sq
            INNER JOIN questions q ON sq.question_id = q.id
            WHERE sq.session_id = ?
            ORDER BY sq.order_no ASC`,
            [sessionId]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách câu hỏi theo thứ tự thành công',
            data: {
                session_id: Number(sessionId),
                status: sessions[0].status,
                total_questions: questions.length,
                questions
            }
        });
    } catch (error) {
        console.error('Lỗi API getSessionQuestions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lấy danh sách câu hỏi',
            error: error.message
        });
    }
};

// POST /api/v1/sessions/:id/answers
const submitAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;
        const { session_question_id, answer_text } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!session_question_id || !answer_text || answer_text.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp session_question_id và nội dung câu trả lời (answer_text)'
            });
        }

        // 2. Kiểm tra phiên phỏng vấn có tồn tại, thuộc về user và đang mở không
        const [sessions] = await db.query(
            'SELECT id, status FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy phiên phỏng vấn hoặc bạn không có quyền truy cập'
            });
        }

        if (sessions[0].status !== 'IN_PROGRESS') {
            return res.status(400).json({
                status: 'error',
                message: 'Phiên phỏng vấn đã kết thúc, không thể gửi thêm câu trả lời'
            });
        }

        // 3. Kiểm tra câu hỏi có thuộc phiên phỏng vấn này không
        const [sqRows] = await db.query(
            'SELECT id, order_no FROM session_questions WHERE id = ? AND session_id = ?',
            [session_question_id, sessionId]
        );

        if (sqRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Câu hỏi không thuộc phiên phỏng vấn này'
            });
        }

        // 4. Lưu câu trả lời vào bảng answers (nếu đã trả lời câu này trước đó thì cập nhật lại)
        const [existingAnswers] = await db.query(
            'SELECT id FROM answers WHERE session_id = ? AND session_question_id = ?',
            [sessionId, session_question_id]
        );

        let answerId;
        if (existingAnswers.length > 0) {
            answerId = existingAnswers[0].id;
            await db.query(
                'UPDATE answers SET answer_text = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
                [answer_text.trim(), answerId]
            );
        } else {
            const [insertRes] = await db.query(
                'INSERT INTO answers (session_id, session_question_id, answer_text) VALUES (?, ?, ?)',
                [sessionId, session_question_id, answer_text.trim()]
            );
            answerId = insertRes.insertId;
        }

        return res.status(201).json({
            status: 'success',
            message: 'Lưu câu trả lời ứng viên thành công',
            data: {
                answer_id: answerId,
                session_id: Number(sessionId),
                session_question_id: Number(session_question_id),
                answer_text: answer_text.trim()
            }
        });
    } catch (error) {
        console.error('Lỗi API submitAnswer:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lưu câu trả lời',
            error: error.message
        });
    }
};

module.exports = {
    createSession,
    getSessionQuestions,
    submitAnswer
};