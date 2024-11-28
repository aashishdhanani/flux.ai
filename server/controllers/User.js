const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, email, password, goals, budget } = req.body;
  
  try {
    const newUser = new User({ username, email, password, goals, budget });
    const user = await newUser.save();
    res.json({ message: 'Registration successful', user });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error creating user', 
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user || password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      success: true,
      message: 'Login successful',
      userData: {
        username: user.username,
        token: 'logged-in'
      }
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error during login', 
      error: err.message 
    });
  }
};
