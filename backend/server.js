require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { inputSanitizer, securityHeaders } = require('./middlewares/securityMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const positionRoutes = require('./routes/positionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình CORS chặt chẽ theo danh sách Origin được phép (NFR-02)
const defaultAllowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

const corsOptions = {
    origin: (origin, callback) => {
        // Cho phép các công cụ nội bộ không gửi header Origin (PowerShell, Postman, curl) hoặc thuộc whitelist
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} không được phép truy cập theo chính sách CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(inputSanitizer);

// Route kiểm tra kết nối server & database
app.get('/api/v1/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).json({
            status: 'success',
            message: 'Server & Database đang hoạt động bình thường'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi kết nối Database',
            error: error.message
        });
    }
});

// Đăng ký các nhóm API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/admin', adminRoutes);

// Bắt lỗi CORS và lỗi JSON không hợp lệ
app.use((err, req, res, next) => {
    if (err && err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            status: 'error',
            message: err.message
        });
    }
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            status: 'error',
            message: 'Dữ liệu JSON gửi lên không đúng định dạng'
        });
    }
    return next(err);
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});