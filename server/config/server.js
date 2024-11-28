const serverConfig = {
  PORT: process.env.PORT || 3000,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  corsOptions: {
    origin: (origin, callback) => {
      // Allow requests with no origin 
      // (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (origin.startsWith('chrome-extension://') || 
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1')) {
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