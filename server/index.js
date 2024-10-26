const express = require('express');
const mongoose = require("mongoose");
const app = express();

const cors = require('cors');

app.use(cors())

//connect to mongo
mongoose.connect('mongodb://localhost:27017/fluxai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

//user schema
const userSchema = new mongoose.Schema({
  userName: {type: String, required: true, unique: true},
  email: { type: String, required: true},
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);
module.exports = { User };

//product schema
const productSchema = new mongoose.Schema({
  ecommerceSite: {type: String, required: true, unqiue: true},
  productName: {type: String, required: true, unqiue: true},
  productCategory: {type: String, required: true, unqiue: true},
  productPrice: {type: String, required: true, unqiue: true},
  productBrand: {type: String, required: true, unqiue: true},
})
const Product = mongoose.model('Product', productSchema);
module.exports = {Product};

//register route
app.post('/register', async (req, res) => {
  const {userName, email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userName, email, password: hashedPassword });
    const user = await newUser.save();
    res.json({ message: 'Registration successful', user });
  } catch (err) {
    res.status(400).json({ message: 'Error', error: err });
  }
});

//login route
app.post('/login', async (req, res) => {
  const {userName, email, password} = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ message: 'Error', error: err });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

