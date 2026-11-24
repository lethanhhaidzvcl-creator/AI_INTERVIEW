const db = require('../config/db');

// GET /api/v1/positions
const getPositions = async (req, res) => {
    try {
        const [positions] = await db.query(
            'SELECT id, name, level, description FROM job_positions WHERE is_active = TRUE ORDER BY id ASC'
        );

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