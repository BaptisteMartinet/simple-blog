const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const CommentSchema = new Schema({
  postId: { type:ObjectId, ref: 'Post', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
});

const Comment = mongoose.model('Comment', CommentSchema, 'comments');

module.exports = Comment;
