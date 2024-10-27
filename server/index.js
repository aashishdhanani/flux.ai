const express = require('express');
const mongoose = require("mongoose");
const app = express();

const cors = require('cors');

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true
}));

app.use(express.json());  // This is critical for parsing JSON bodies
app.use(express.urlencoded({ extended: true }));


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
  username: {type: String, required: true, unique: true},
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


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

