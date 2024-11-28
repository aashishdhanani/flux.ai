const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { serverConfig } = require('./config/server');
const errorMiddleware = require('./middleware/error');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const userRoutes = require('./routes/User');
const eventRoutes = require('./routes/Event');
const analyticsRoutes = require('./routes/Analytics');

// Initialize express application
const app = express();

// Middleware Configuration
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(serverConfig.corsOptions));
app.use('/api/', rateLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorMiddleware);

// Database Connection
connectDB();

// Server Initialization
const server = app.listen(serverConfig.PORT, () => {
  console.log(`Server running on port ${serverConfig.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed. Disconnecting from MongoDB...');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed. Process terminating...');
      process.exit(0);
    });
  });
});

module.exports = { app };