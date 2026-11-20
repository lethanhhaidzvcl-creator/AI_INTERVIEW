const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', sessionController.createSession);
router.get('/history', sessionController.getSessionHistory);
router.get('/:id/questions', sessionController.getSessionQuestions);
router.post('/:id/answers', sessionController.submitAnswer);
router.post('/:id/finish', sessionController.finishSession);
router.get('/:id/result', sessionController.getSessionResult);

module.exports = router;