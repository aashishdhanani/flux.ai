const rateLimit = require('express-rate-limit');
const { serverConfig } = require('../config/server');

module.exports = rateLimit({
  windowMs: serverConfig.RATE_LIMIT_WINDOW,
  max: serverConfig.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.'
});