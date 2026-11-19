const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Không tìm thấy token xác thực (Vui lòng đăng nhập)'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            status: 'error',
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            status: 'error',
            message: 'Bạn không có quyền thực hiện thao tác quản trị (Yêu cầu quyền ADMIN)'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin
};