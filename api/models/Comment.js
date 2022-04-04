const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const CommentSchema = new Schema({
  post: { type: ObjectId, ref: 'Post', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
}, { timestamps: true });

const Comment = mongoose.model('Comment', CommentSchema, 'comments');

module.exports = Comment;
