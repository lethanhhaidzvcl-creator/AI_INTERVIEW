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

        return res.status(201).json({
            status: 'success',
            message: 'Khởi tạo phiên phỏng vấn thành công',
            data: {
                sessionId: result.insertId,
                userId,
                position: positions[0],
                status: initialStatus,
                total_questions: numQuestions
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

module.exports = {
    createSession
};