// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();
const { spawn } = require('child_process');


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
  const textData = "The customer has a tendency to splurge on luxury items, often spending $130 or more on a single purchase. This habit may be related to their financial goal of getting better at investing, as they may be looking to diversify their assets with unique and exclusive items. The customer's monthly budget of $1000 provides some flexibility to make adjustments and prioritize their spending. It may be helpful to set aside a portion of their budget for long-term investments, such as a retirement account or a diversified portfolio. recommendations: [Reduce spending on luxury items and allocate funds towards more strategic investments].";
  res.json({ text: textData });
});

function extractCategories(pythonOutput) {
  try {
    // Log the raw output for debugging
    console.log('Raw Python output:', pythonOutput);
    
    // Find the last line that contains valid JSON
    const lines = pythonOutput.split('\n');
    let jsonLine = '';
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line) {  // Find the last non-empty line
        try {
          JSON.parse(line);  // Test if it's valid JSON
          jsonLine = line;
          break;
        } catch (e) {
          continue;
        }
      }
    }
    
    if (!jsonLine) {
      console.error('No valid JSON found in Python output');
      return [];
    }

    // Parse the JSON data
    const data = JSON.parse(jsonLine);
    
    // Validate the data structure
    if (!data || !data.category_analysis || !Array.isArray(data.category_analysis.categories)) {
      console.error('Invalid data format: missing or invalid categories array');
      return [];
    }

    // Transform to desired format
    return data.category_analysis.categories
      .filter(category => {
        // Validate each category has required properties
        return category && 
               typeof category.category_name === 'string' && 
               Array.isArray(category.products);
      })
      .map(category => ({
        title: category.category_name,
        products: category.products
          .filter(product => product && typeof product.product_name === 'string')
          .map(product => product.product_name)
      }))
      .filter(category => category.products.length > 0);

  } catch (error) {
    console.error('Error parsing Python output:', error);
    console.error('Python output received:', pythonOutput);
    return [];
  }
}

app.get("/categories", async (req, res) => {
  try {
    // Sample data (in production, this would come from your database)
    const data = {
      "categories": [
        {
          "category_name": "Electronics",
          "products": [
            {
              "product_name": "Hercules DJControl Inpulse 200 MK2 — Ideal DJ Controller for Learning to Mix — Software and Tutorials Included, Black",
              "description": "The customer has shown interest in music production and DJing, trying to save money and invest in their hobby. They have a moderate budget for electronics and tend to shop on Amazon."
            },
            {
              "product_name": "Nespresso VertuoPlus Coffee Maker and Espresso Machine by DeLonghi Black Matte",
              "description": "The customer enjoys coffee and has a high willingness to spend on quality products. They have already spent money on this product and tend to shop on multiple platforms, including Target."
            }
          ]
        },
        {
          "category_name": "Miscellaneous",
          "products": [
            {
              "product_name": "Casio GA-B2100-2AJF [G-Shock GA-B2100 Series Men's Rubber Band] Watch Shipped from Japan Released in Apr 2022",
              "description": "The customer has shown interest in fashion and accessories, trying to save money on high-quality products. They have a moderate budget for miscellaneous items and tend to shop on multiple platforms, including Amazon."
            },
            {
              "product_name": "NIKE AIR JORDAN 1 RETRO WHAT THE HORNETS PROMO SAMPLE PE PLAYER EXCLUSIVE US 13",
              "description": "The customer is interested in sneakers and has a high willingness to spend on exclusive products. They have already spent money on this product and tend to shop on multiple platforms, including eBay."
            }
          ]
        }
      ]
    };

    // Transform the data into the required format
    const transformedData = data.categories.map(category => ({
      title: category.category_name,
      products: category.products.map(product => product.product_name)
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error processing categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example usage in Express route
// app.get("/categories", async (req, res) => {
//   try {
//     const pythonProcess = spawn('python', ['../ai_agents.py', 'M. McFly']);
    
//     let dataString = '';
    
//     pythonProcess.stdout.on('data', (data) => {
//       dataString += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error(`Python stderr: ${data}`);
//     });

//     pythonProcess.on('close', (code) => {
//       if (code !== 0) {
//         console.error(`Python process exited with code ${code}`);
//         return res.status(500).json({ error: 'Failed to process categories' });
//       }

//       try {
//         const categories = extractCategories(dataString);
//         res.json(categories);
//       } catch (error) {
//         console.error('Error processing categories:', error);
//         res.status(500).json({ 
//           error: 'Failed to process categories',
//           details: error.message
//         });
//       }
//     });
    
//   } catch (error) {
//     console.error('Error getting categories:', error);
//     res.status(500).json({ 
//       error: 'Failed to get categories',
//       details: error.message 
//     });
//   }
// });
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
