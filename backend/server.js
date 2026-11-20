require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const positionRoutes = require('./routes/positionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});