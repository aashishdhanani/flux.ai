const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/Analytics');

router.get('/session/:sessionId', analyticsController.getSessionAnalytics);
router.get('/categories', analyticsController.getCategories);

module.exports = router;