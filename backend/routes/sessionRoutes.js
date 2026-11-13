const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /api/v1/sessions
router.post('/', verifyToken, sessionController.createSession);

// GET /api/v1/sessions/:id/questions
router.get('/:id/questions', verifyToken, sessionController.getSessionQuestions);

module.exports = router;