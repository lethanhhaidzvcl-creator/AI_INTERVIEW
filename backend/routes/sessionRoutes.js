const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /api/v1/sessions
router.post('/', verifyToken, sessionController.createSession);

module.exports = router;