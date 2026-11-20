const db = require('../config/db');

// GET /api/v1/users/profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            'SELECT id, full_name, email, target_role, skills, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy người dùng'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin hồ sơ thành công',
            data: users[0]
        });
    } catch (error) {
        console.error('Lỗi API getProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lấy thông tin hồ sơ',
            error: error.message
        });
    }
};

// PUT /api/v1/users/profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, target_role, skills } = req.body;

        if (!full_name || full_name.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Họ tên không được để trống'
            });
        }

        await db.query(
            'UPDATE users SET full_name = ?, target_role = ?, skills = ? WHERE id = ?',
            [full_name.trim(), target_role || null, skills || null, userId]
        );

        const [updatedUsers] = await db.query(
            'SELECT id, full_name, email, target_role, skills, role FROM users WHERE id = ?',
            [userId]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật hồ sơ thành công',
            data: updatedUsers[0]
        });
    } catch (error) {
        console.error('Lỗi API updateProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi cập nhật hồ sơ',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};