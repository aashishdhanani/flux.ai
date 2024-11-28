const mongoose = require('mongoose');

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

userSchema.virtual('productEvents', {
  ref: 'ProductEvent',
  localField: '_id',
  foreignField: 'userId'
});

module.exports = mongoose.model('User', userSchema);