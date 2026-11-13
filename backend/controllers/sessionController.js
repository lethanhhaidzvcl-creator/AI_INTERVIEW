const db = require('../config/db');

// POST /api/v1/sessions
const createSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { position_id, total_questions } = req.body;

        // 1. Kiểm tra đầu vào bắt buộc
        if (!position_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn vị trí ứng tuyển (position_id)'
            });
        }

        // 2. Kiểm tra position_id có tồn tại và đang hoạt động trong bảng job_positions không
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

        // 3. Khởi tạo phiên phỏng vấn mới vào bảng interview_sessions
        const [result] = await db.query(
            'INSERT INTO interview_sessions (user_id, position_id, status, total_questions) VALUES (?, ?, ?, ?)',
            [userId, position_id, initialStatus, numQuestions]
        );

        const sessionId = result.insertId;

        // 4. Chọn ngẫu nhiên các câu hỏi không trùng lặp theo position_id và lưu vào session_questions
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

        // 1. Kiểm tra phiên phỏng vấn có tồn tại và thuộc về user đang đăng nhập không
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

        // 2. Truy xuất danh sách câu hỏi theo thứ tự order_no, đảm bảo không lặp lại
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

module.exports = {
    createSession,
    getSessionQuestions
};