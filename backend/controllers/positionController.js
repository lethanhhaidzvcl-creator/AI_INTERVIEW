const db = require('../config/db');

// GET /api/v1/positions
const getPositions = async (req, res) => {
    try {
        // Lấy danh sách vị trí từ bảng positions (hoặc mock data nếu DB chưa seed bảng)
        let positions = [];
        try {
            const [rows] = await db.query('SELECT * FROM positions');
            positions = rows;
        } catch (dbError) {
            // Dữ liệu mẫu chuẩn bị sẵn nếu DB chưa tạo bảng positions
            positions = [
                {
                    id: 1,
                    title: 'Frontend Developer',
                    description: 'Phỏng vấn chuyên sâu về React, JavaScript, HTML/CSS và tối ưu hiệu năng web',
                    levels: ['Fresher', 'Junior', 'Senior']
                },
                {
                    id: 2,
                    title: 'Backend Developer',
                    description: 'Phỏng vấn về Node.js, Express, thiết kế RESTful API, Database MySQL và xác thực JWT',
                    levels: ['Fresher', 'Junior', 'Senior']
                },
                {
                    id: 3,
                    title: 'Fullstack Developer',
                    description: 'Phỏng vấn toàn diện kiến trúc Client - Server, tích hợp API và triển khai ứng dụng',
                    levels: ['Junior', 'Senior']
                }
            ];
        }

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh mục vị trí ứng tuyển thành công',
            data: positions
        });
    } catch (error) {
        console.error('Lỗi API getPositions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lấy danh mục vị trí',
            error: error.message
        });
    }
};

module.exports = {
    getPositions
};