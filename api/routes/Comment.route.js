const express = require('express');
const router = express.Router();
const auth = require('../midlewares/auth');
const { Post, Comment } = require('../models');

/**
 * @description Get all comments
 * @param postId Get comments of a specific post
 * @param limit Limit the number of returned posts
 */
router.get('/', async (req, res) => {
  const { postId, limit } = req.query;
  const comments = await Comment.find({ postId }, null, { limit: limit ?? Infinity }).populate('user');
  res.json(comments);
});

/**
 * @description Create a comment
 * @param body The comment body
 */
router.post('/', auth, async (req, res) => {
  const { postId } = req.query;
  const { body } = req.body;
  const { userId } = req.ctx;
  if (!postId)
    return res.status(400).send('Missing postId param');
  if (!body)
    return res.status(400).send('Invalid body.');
  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).send('Post does not exists');
  await Comment.create({
    postId,
    user: userId,
    body,
  });
  post.comments += 1;
  await post.save();
  return res.send('Comment successfully created.');
});

module.exports = router;
