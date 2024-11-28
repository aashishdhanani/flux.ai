exports.validateEventPayload = (req, res, next) => {
    const { sessionId, platform, productUrl, productTitle, username } = req.body;
    
    if (!sessionId || !platform || !productUrl || !productTitle || !username) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: ['sessionId', 'platform', 'productUrl', 'productTitle', 'userId']
      });
    }
    next();
  };