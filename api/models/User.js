const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true, select: false },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema, 'users');

module.exports = User;
