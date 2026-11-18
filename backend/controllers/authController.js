const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// POST /api/v1/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra đầu vào
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng nhập đầy đủ email và mật khẩu'
            });
        }

        // 2. Tìm người dùng theo email trong database
        const [users] = await db.query(
            'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Email hoặc mật khẩu không chính xác'
            });
        }

        const user = users[0];

        // 3. So khớp mật khẩu với chuỗi hash trong database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Email hoặc mật khẩu không chính xác'
            });
        }

        // 4. Tạo JWT token
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'ai_interview_secret_key_2026',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Lỗi API login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi đăng nhập',
            error: error.message
        });
    }
};

// POST /api/v1/auth/logout
const logout = async (req, res) => {
    return res.status(200).json({
        status: 'success',
        message: 'Đăng xuất thành công'
    });
};

module.exports = {
    register,
    login,
    logout
};