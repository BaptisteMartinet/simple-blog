const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const PostSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  views: { type: Number, default: 0, required: true },
  comments: [{ type: ObjectId, ref: 'Comment', required: true }],
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema, 'posts');

module.exports = Post;
