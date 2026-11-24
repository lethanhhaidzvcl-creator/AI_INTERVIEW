
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Kiểm tra token và lấy thông tin user mới nhất từ MySQL
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
        return res.status(401).json({
            status: 'error',
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }

    const token = authHeader.split(/\s+/)[1];

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }

    // Kiểm tra id lấy từ JWT
    if (!decoded || !decoded.id) {
        return res.status(401).json({
            status: 'error',
            message: 'Thông tin xác thực không hợp lệ'
        });
    }

    try {
        // Lấy quyền hiện tại từ database
        const [users] = await db.query(
            'SELECT id, email, full_name, role FROM users WHERE id = ?',
            [decoded.id]
        );

        // Tài khoản đã bị xóa hoặc không tồn tại
        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Tài khoản không còn tồn tại'
            });
        }

        const user = users[0];

        // Không sử dụng role cũ trong JWT
        req.user = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Lỗi xác thực người dùng:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Không thể xác thực tài khoản lúc này'
        });
    }
};

// Chỉ tài khoản ADMIN hiện tại mới được truy cập
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            status: 'error',
            message: 'Bạn không có quyền quản trị'
        });
    }

    next();
};

module.exports = {
    verifyToken,
    isAdmin
};
