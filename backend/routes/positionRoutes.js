const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

// GET /api/v1/positions
router.get('/', positionController.getPositions);

module.exports = router;