
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const positionRoutes = require('./routes/positionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Danh sách website được phép gọi API
const allowedOrigins = (
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
)
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Cho phép yêu cầu không có Origin
        // như Postman hoặc kết nối từ server khác
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS origin không được phép'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Giới hạn kích thước dữ liệu JSON
app.use(express.json({ limit: '1mb' }));

// API kiểm tra Server và MySQL
app.get('/api/v1/health', async (req, res) => {
    try {
        await db.query('SELECT 1');

        return res.status(200).json({
            status: 'success',
            message: 'Server & Database đang hoạt động bình thường'
        });
    } catch (error) {
        console.error('Database health check failed:', error);

        return res.status(503).json({
            status: 'error',
            message: 'Dịch vụ tạm thời không khả dụng'
        });
    }
});

// Đăng ký các nhóm API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use("/api/v1/feedback", feedbackRoutes);

// Xử lý lỗi không mong muốn
app.use((err, req, res, next) => {
    console.error('Backend error:', err);

    if (err.message === 'CORS origin không được phép') {
        return res.status(403).json({
            status: 'error',
            message: 'Nguồn truy cập không được phép'
        });
    }

    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            status: 'error',
            message: 'Dữ liệu gửi lên quá lớn'
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            status: 'error',
            message: 'Dữ liệu JSON không hợp lệ'
        });
    }

    return res.status(500).json({
        status: 'error',
        message: 'Đã xảy ra lỗi máy chủ'
    });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
