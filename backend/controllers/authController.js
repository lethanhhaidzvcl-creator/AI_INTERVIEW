const bcrypt = require('bcryptjs');
const db = require('../config/db');

// POST /api/v1/auth/register
const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // 1. Kiểm tra trường bắt buộc
        if (!full_name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu'
            });
        }

        // 2. Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Định dạng email không hợp lệ'
            });
        }

        // 3. Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // 4. Chống trùng email trong CSDL
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Email này đã được sử dụng'
            });
        }

        // 5. Băm mật khẩu bằng bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Lưu user vào MySQL (bảng users theo schema.sql)
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'candidate']
        );

        return res.status(201).json({
            status: 'success',
            message: 'Đăng ký tài khoản thành công',
            data: {
                userId: result.insertId,
                full_name,
                email
            }
        });
    } catch (error) {
        console.error('Lỗi API register:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi đăng ký',
            error: error.message
        });
    }
};

module.exports = {
    register
};