const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({
            status: 'ok',
            message: 'ket noi mysql thanh cong',
            data: rows
        });
    } catch (error) {
        console.error('loi ket noi mysql:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'loi ket noi co so du lieu',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`server dang chay tai port ${port}`);
});