const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // Header gửi lên dạng: Bearer <token>
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng cung cấp token xác thực (Bearer token)'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ai_interview_secret_key_2026');
        
        // Gán thông tin user vào request để các controller sau sử dụng
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token không hợp lệ hoặc đã hết hạn',
            error: error.message
        });
    }
};

module.exports = {
    verifyToken
};