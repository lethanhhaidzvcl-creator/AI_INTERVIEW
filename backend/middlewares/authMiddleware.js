const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Không tìm thấy token xác thực hợp lệ (Định dạng yêu cầu: Bearer <token>)'
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
        return res.status(401).json({
            status: 'error',
            message: 'Token xác thực không được để trống'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        req.user = {
            id: Number(decoded.id),
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
            });
        }
        return res.status(403).json({
            status: 'error',
            message: 'Token không hợp lệ hoặc đã bị thay đổi'
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