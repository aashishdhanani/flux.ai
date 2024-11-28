const express = require('express');
const router = express.Router();
const eventController = require('../controllers/Event');
const { validateEventPayload } = require('../middleware/validation');

router.post('/', validateEventPayload, eventController.recordEvent);

module.exports = router;