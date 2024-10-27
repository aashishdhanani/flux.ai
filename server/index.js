// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config()

console.log(process.env.PORT)
// Initialize express application
const app = express();

/**
 * Server Configuration Constants
 */
const CONFIG = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_tracker',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100 // Maximum 100 requests per window
};

/**
 * Middleware Configuration
 */

// Security middleware
app.use(helmet());

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Configure CORS for Chrome extension
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from Chrome extensions and localhost during development
    if (origin?.startsWith('chrome-extension://') || origin?.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'X-Extension-ID', 'X-Tab-ID', 'X-Session-ID'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

/**
 * MongoDB Schema Definitions
 */

// Schema for tracking product view events
const ProductEventSchema = new mongoose.Schema({
  // Session and timing information
  sessionId: { 
    type: String, 
    required: true,
    index: true 
  },
  timestamp: {
    type: Date,
    default: Date.now
  },

  // Product information
  platform: {
    type: String,
    required: true,
    index: true
  },
  productUrl: {
    type: String,
    required: true
  },
  productTitle: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for common queries
/* ProductEventSchema.index({ platform: 1, 'productDetails.category': 1 });
ProductEventSchema.index({ timestamp: -1 });
ProductEventSchema.index({ sessionId: 1, timestamp: -1 }); */

// Create MongoDB model
const ProductEvent = mongoose.model('ProductEvent', ProductEventSchema);

/**
 * Route Handlers
 */

// Validate request payload
const validateEventPayload = (req, res, next) => {
  const { sessionId, platform, productUrl, productTitle } = req.body;
  
  if (!sessionId || !platform || !productUrl || !productTitle) {
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['sessionId', 'platform', 'productUrl', 'productDetails', 'productTitle']
    });
  }
  next();
};

// Record product view/exit events
app.post('/api/events', validateEventPayload, async (req, res) => {
  try {
    const eventData = new ProductEvent({
      ...req.body
    });

    await eventData.save();

    res.status(200).json({
      success: true,
      message: 'Event recorded successfully',
      eventId: eventData._id
    });
  } catch (error) {
    console.error('Error recording event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get session analytics
app.get('/api/analytics/session/:sessionId', async (req, res) => {
  try {
    const sessionEvents = await ProductEvent.find({
      sessionId: req.params.sessionId
    }).sort({ timestamp: 1 });

    if (!sessionEvents.length) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Calculate session metrics
    const sessionMetrics = {
      totalTimeSpent: 0,
      productsViewed: new Set(),
      averageTimePerProduct: 0,
      platformsVisited: new Set()
    };

    sessionEvents.forEach(event => {
      if (event.userMetrics?.timeSpentSeconds) {
        sessionMetrics.totalTimeSpent += event.userMetrics.timeSpentSeconds;
      }
      sessionMetrics.productsViewed.add(event.productUrl);
      sessionMetrics.platformsVisited.add(event.platform);
    });

    sessionMetrics.averageTimePerProduct = 
      sessionMetrics.totalTimeSpent / sessionMetrics.productsViewed.size;

    res.json({
      success: true,
      sessionId: req.params.sessionId,
      metrics: {
        ...sessionMetrics,
        productsViewed: sessionMetrics.productsViewed.size,
        platformsVisited: Array.from(sessionMetrics.platformsVisited)
      },
      events: sessionEvents
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session analytics'
    });
  }
});

/**
 * Database Connection
 */
mongoose.connect(CONFIG.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Successfully connected to MongoDB.');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

/**
 * Error Handling Middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Server Initialization
 */
const server = app.listen(CONFIG.PORT, () => {
  console.log(`Server running on port ${CONFIG.PORT}`);
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

module.exports = app;
app.use(express.urlencoded({ extended: true }));

//user schema
const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: { type: String, required: true},
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);
module.exports = { User };

//register route
app.post('/register', async (req, res) => {
  const {username, email, password} = req.body;
  console.log("Received data:", req.body);

  // Validate input
  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
      const newUser = new User({
          username: username,
          email: email,
          password: password
      });

      console.log("Attempting to save user:", newUser);
      
      const user = await newUser.save();
      console.log("User saved successfully:", user);
      
      res.json({ message: 'Registration successful', user });
  } catch (err) {
      console.error("Error saving user:", err);
      return res.status(400).json({ 
          message: 'Error creating user', 
          error: err.message  // Send the actual error message
      });
  }
});

//login route
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  console.log(req.body);

  if (!username || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    console.log(user);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //const isMatch = await bcrypt.compare(password, user.password);

    if (password != user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ message: 'Error', error: err });
  }
});

