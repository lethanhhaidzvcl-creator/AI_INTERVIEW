const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);

// Quản trị danh mục vị trí
router.get('/positions', adminController.getAllPositionsAdmin);
router.post('/positions', adminController.createPosition);
router.put('/positions/:id', adminController.updatePosition);
router.patch('/positions/:id/hide', adminController.hidePosition);

// Quản trị ngân hàng câu hỏi
router.get('/questions', adminController.getAllQuestionsAdmin);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.patch('/questions/:id/hide', adminController.hideQuestion);

module.exports = router;