// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

// Initialize express application
const app = express();

/**
 * Server Configuration Constants
 */
const CONFIG = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_tracker',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100 // Maximum 100 requests per window
};

/**
 * Middleware Configuration
 */
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure CORS for Chrome extension
const corsOptions = {
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

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  goals: { type: [String], required: true },
  budget: { type: Number, required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual property to get all product events for a user
userSchema.virtual('productEvents', {
  ref: 'ProductEvent',
  localField: '_id',
  foreignField: 'userId'
});

const User = mongoose.model('User', userSchema);

// Product Event Schema
const ProductEventSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
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
ProductEventSchema.index({ userId: 1, timestamp: -1 });
ProductEventSchema.index({ platform: 1, userId: 1 });
ProductEventSchema.index({ sessionId: 1, timestamp: -1 });

const ProductEvent = mongoose.model('ProductEvent', ProductEventSchema);

/**
 * Route Handlers
 */

// Validate event payload middleware
const validateEventPayload = (req, res, next) => {
  const { sessionId, platform, productUrl, productTitle, username } = req.body;
  
  if (!sessionId || !platform || !productUrl || !productTitle || !username) {
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['sessionId', 'platform', 'productUrl', 'productTitle', 'userId']
    });
  }
  next();
};

// Record product event
app.post('/api/events', validateEventPayload, async (req, res) => {
  try {
    // Look up user by username instead of ID
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const eventData = new ProductEvent({
      ...req.body,
      userId: user._id  // Store the user's ID in the event
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

// Get user's events
app.get('/api/users/:userId/events', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'productEvents',
        options: { sort: { timestamp: -1 } }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      userId: user._id,
      events: user.productEvents
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user events'
    });
  }
});

// Get user's events with analytics
app.get('/api/users/:userId/analytics', async (req, res) => {
  try {
    const events = await ProductEvent.find({ userId: req.params.userId })
      .sort({ timestamp: -1 });

    if (!events.length) {
      return res.status(404).json({
        success: false,
        error: 'No events found for this user'
      });
    }

    // Calculate user-specific metrics
    const analytics = {
      totalEvents: events.length,
      uniqueProducts: new Set(events.map(e => e.productUrl)).size,
      platformBreakdown: {},
      averagePrice: 0,
      totalSpent: 0
    };

    // Calculate platform breakdown and price metrics
    events.forEach(event => {
      analytics.platformBreakdown[event.platform] = 
        (analytics.platformBreakdown[event.platform] || 0) + 1;
      analytics.totalSpent += event.price;
    });

    analytics.averagePrice = analytics.totalSpent / events.length;

    res.json({
      success: true,
      userId: req.params.userId,
      analytics,
      events
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
});

// Register route
app.post('/register', async (req, res) => {
  const {username, email, password, goals, budget} = req.body;
  console.log("Received data:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const newUser = new User({
      username,
      email,
      password,
      goals,
      budget
    });

    console.log("Attempting to save user:", newUser);
    
    const user = await newUser.save();
    console.log("User saved successfully:", user);
    
    res.json({ message: 'Registration successful', user });
  } catch (err) {
    console.error("Error saving user:", err);
    return res.status(400).json({ 
      message: 'Error creating user', 
      error: err.message
    });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  console.log("Login attempt for:", username);

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    console.log("Found user:", user ? "yes" : "no");

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Send back a more specific response for the extension
    res.json({ 
      success: true,
      message: 'Login successful',
      userData: {
        username: user.username,
        token: 'logged-in' // Simple token for now, you might want to implement proper JWT
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ message: 'Error during login', error: err.message });
  }
});

// AI category analysis endpoints
app.get("/AI_categories_brands_consult", (req, res) => {
  const textData = "This is the text from the backend that will appear gradually.";
  res.json({ text: textData });
});

app.get("/categories", (req, res) => {
  const categories = [
    {
      title: "Category 1",
      products: ["Product 1", "Product 2", "Product 3"],
    },
    {
      title: "Category 2",
      products: ["Product A", "Product B"],
    },
  ];

  res.json(categories);
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

module.exports = { app, User, ProductEvent };