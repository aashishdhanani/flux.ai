const ProductEvent = require('../models/ProductEvent');
const { extractCategories } = require('../utils/categoryExtractor');

exports.getSessionAnalytics = async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session analytics'
    });
  }
};


exports.getCategories = async (req, res) => {
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
  };
