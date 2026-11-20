const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { validateNumericIdParam } = require('../middlewares/securityMiddleware');

router.use(verifyToken, isAdmin);

// Quản trị danh mục vị trí
router.get('/positions', adminController.getAllPositionsAdmin);
router.post('/positions', adminController.createPosition);
router.put('/positions/:id', validateNumericIdParam, adminController.updatePosition);
router.patch('/positions/:id/hide', validateNumericIdParam, adminController.hidePosition);

// Quản trị ngân hàng câu hỏi
router.get('/questions', adminController.getAllQuestionsAdmin);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', validateNumericIdParam, adminController.updateQuestion);
router.patch('/questions/:id/hide', validateNumericIdParam, adminController.hideQuestion);

module.exports = router;