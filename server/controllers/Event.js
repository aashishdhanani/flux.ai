const ProductEvent = require('../models/ProductEvent');
const User = require('../models/User');

exports.recordEvent = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const eventData = new ProductEvent({
      ...req.body,
      userId: user._id
    });

    await eventData.save();

    res.status(200).json({
      success: true,
      message: 'Event recorded successfully',
      eventId: eventData._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};