const serverConfig = {
    PORT: process.env.PORT || 3000,
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100,
    corsOptions: {
      origin: (origin, callback) => {
        if (origin?.startsWith('chrome-extension://') || origin?.startsWith('http://localhost')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['POST', 'GET'],
      allowedHeaders: ['Content-Type', 'X-Extension-ID', 'X-Tab-ID', 'X-Session-ID'],
      credentials: true
    }
  };
  
module.exports = { serverConfig };
