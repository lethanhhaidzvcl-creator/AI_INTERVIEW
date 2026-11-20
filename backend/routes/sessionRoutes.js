const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateNumericIdParam } = require('../middlewares/securityMiddleware');

router.use(verifyToken);

router.post('/', sessionController.createSession);
router.get('/history', sessionController.getSessionHistory);
router.get('/:id/questions', validateNumericIdParam, sessionController.getSessionQuestions);
router.post('/:id/answers', validateNumericIdParam, sessionController.submitAnswer);
router.post('/:id/finish', validateNumericIdParam, sessionController.finishSession);
router.get('/:id/result', validateNumericIdParam, sessionController.getSessionResult);

module.exports = router;