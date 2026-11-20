const db = require('../config/db');

// ==================== QUẢN TRỊ VỊ TRÍ (job_positions) ====================

const getAllPositionsAdmin = async (req, res) => {
    try {
        const [positions] = await db.query(
            'SELECT id, name, description, level, is_active, created_at FROM job_positions ORDER BY id DESC'
        );
        return res.status(200).json({
            status: 'success',
            data: positions
        });
    } catch (error) {
        console.error('Lỗi getAllPositionsAdmin:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống', error: error.message });
    }
};

const createPosition = async (req, res) => {
    try {
        const { name, description, level } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Tên vị trí ứng tuyển (name) không được để trống'
            });
        }

        const validLevels = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];
        const positionLevel = level && validLevels.includes(level.toUpperCase()) ? level.toUpperCase() : 'JUNIOR';

        const [result] = await db.query(
            'INSERT INTO job_positions (name, description, level, is_active) VALUES (?, ?, ?, TRUE)',
            [name.trim(), description || null, positionLevel]
        );

        return res.status(201).json({
            status: 'success',
            message: 'Thêm vị trí ứng tuyển thành công',
            data: {
                id: result.insertId,
                name: name.trim(),
                description: description || null,
                level: positionLevel,
                is_active: true
            }
        });
    } catch (error) {
        console.error('Lỗi createPosition:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi thêm vị trí', error: error.message });
    }
};

const updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, level, is_active } = req.body;

        const [existing] = await db.query('SELECT * FROM job_positions WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy vị trí ứng tuyển' });
        }

        const current = existing[0];
        const validLevels = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];
        const newName = name && name.trim() !== '' ? name.trim() : current.name;
        const newDesc = description !== undefined ? description : current.description;
        const newLevel = level && validLevels.includes(level.toUpperCase()) ? level.toUpperCase() : current.level;
        const newActive = is_active !== undefined ? Boolean(is_active) : Boolean(current.is_active);

        await db.query(
            'UPDATE job_positions SET name = ?, description = ?, level = ?, is_active = ? WHERE id = ?',
            [newName, newDesc, newLevel, newActive, id]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật vị trí ứng tuyển thành công',
            data: {
                id: Number(id),
                name: newName,
                description: newDesc,
                level: newLevel,
                is_active: newActive
            }
        });
    } catch (error) {
        console.error('Lỗi updatePosition:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi cập nhật vị trí', error: error.message });
    }
};

const hidePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT id FROM job_positions WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy vị trí ứng tuyển' });
        }

        await db.query('UPDATE job_positions SET is_active = FALSE WHERE id = ?', [id]);

        return res.status(200).json({
            status: 'success',
            message: 'Đã ẩn danh mục vị trí ứng tuyển thành công',
            data: { id: Number(id), is_active: false }
        });
    } catch (error) {
        console.error('Lỗi hidePosition:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi ẩn vị trí', error: error.message });
    }
};

// ==================== QUẢN TRỊ CÂU HỎI (questions) ====================

const getAllQuestionsAdmin = async (req, res) => {
    try {
        const { position_id } = req.query;
        let sql = `SELECT q.id, q.position_id, jp.name AS position_name, q.content, q.difficulty, q.sample_answer, q.is_active, q.created_at
                   FROM questions q
                   INNER JOIN job_positions jp ON q.position_id = jp.id`;
        const params = [];

        if (position_id) {
            sql += ' WHERE q.position_id = ?';
            params.push(position_id);
        }
        sql += ' ORDER BY q.id DESC';

        const [questions] = await db.query(sql, params);
        return res.status(200).json({
            status: 'success',
            data: questions
        });
    } catch (error) {
        console.error('Lỗi getAllQuestionsAdmin:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống', error: error.message });
    }
};

const createQuestion = async (req, res) => {
    try {
        const { position_id, content, difficulty, sample_answer } = req.body;

        if (!position_id || !content || content.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp position_id và nội dung câu hỏi (content)'
            });
        }

        const [posRows] = await db.query('SELECT id FROM job_positions WHERE id = ?', [position_id]);
        if (posRows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Vị trí ứng tuyển (position_id) không tồn tại' });
        }

        const validDiffs = ['EASY', 'MEDIUM', 'HARD'];
        const qDiff = difficulty && validDiffs.includes(difficulty.toUpperCase()) ? difficulty.toUpperCase() : 'MEDIUM';

        const [result] = await db.query(
            'INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES (?, ?, ?, ?, TRUE)',
            [position_id, content.trim(), qDiff, sample_answer || null]
        );

        return res.status(201).json({
            status: 'success',
            message: 'Thêm câu hỏi phỏng vấn thành công',
            data: {
                id: result.insertId,
                position_id: Number(position_id),
                content: content.trim(),
                difficulty: qDiff,
                sample_answer: sample_answer || null,
                is_active: true
            }
        });
    } catch (error) {
        console.error('Lỗi createQuestion:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi thêm câu hỏi', error: error.message });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { position_id, content, difficulty, sample_answer, is_active } = req.body;

        const [existing] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy câu hỏi' });
        }

        const current = existing[0];
        const validDiffs = ['EASY', 'MEDIUM', 'HARD'];
        const newPosId = position_id || current.position_id;
        const newContent = content && content.trim() !== '' ? content.trim() : current.content;
        const newDiff = difficulty && validDiffs.includes(difficulty.toUpperCase()) ? difficulty.toUpperCase() : current.difficulty;
        const newSample = sample_answer !== undefined ? sample_answer : current.sample_answer;
        const newActive = is_active !== undefined ? Boolean(is_active) : Boolean(current.is_active);

        await db.query(
            'UPDATE questions SET position_id = ?, content = ?, difficulty = ?, sample_answer = ?, is_active = ? WHERE id = ?',
            [newPosId, newContent, newDiff, newSample, newActive, id]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật câu hỏi thành công',
            data: {
                id: Number(id),
                position_id: Number(newPosId),
                content: newContent,
                difficulty: newDiff,
                sample_answer: newSample,
                is_active: newActive
            }
        });
    } catch (error) {
        console.error('Lỗi updateQuestion:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi cập nhật câu hỏi', error: error.message });
    }
};

const hideQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT id FROM questions WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy câu hỏi' });
        }

        await db.query('UPDATE questions SET is_active = FALSE WHERE id = ?', [id]);

        return res.status(200).json({
            status: 'success',
            message: 'Đã ẩn câu hỏi khỏi ngân hàng đề thành công',
            data: { id: Number(id), is_active: false }
        });
    } catch (error) {
        console.error('Lỗi hideQuestion:', error);
        return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi ẩn câu hỏi', error: error.message });
    }
};

module.exports = {
    getAllPositionsAdmin,
    createPosition,
    updatePosition,
    hidePosition,
    getAllQuestionsAdmin,
    createQuestion,
    updateQuestion,
    hideQuestion
};