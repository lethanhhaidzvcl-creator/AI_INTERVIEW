
const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const requiredVariables = [
    'DB_HOST',
    'DB_USER',
    'DB_NAME'
];

if (isProduction) {
    requiredVariables.push('DB_PASSWORD');

    const missingVariables = requiredVariables.filter(
        name => !process.env[name]?.trim()
    );

    if (missingVariables.length > 0) {
        throw new Error(
            `Thiếu biến môi trường: ${missingVariables.join(', ')}`
        );
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'ai_interview_db',
    port: Number(process.env.DB_PORT || 3306),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // Bật TLS khi nhà cung cấp MySQL yêu cầu.
    // Cần xác thực chứng chỉ máy chủ khi sử dụng trên Cloud.
    ...(process.env.DB_SSL === 'true'
        ? { ssl: { rejectUnauthorized: true } }
        : {})
});

module.exports = pool;
