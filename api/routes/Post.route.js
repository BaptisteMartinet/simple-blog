const express = require('express');
const router = express.Router();
const auth = require('../midlewares/auth');
const { Post } = require('../models');

/**
 * @description Return all the posts stored in DB
 * @param limit Limit the number of posts returned
 * @param searchTerm Filter posts with a search term
 */
router.get('/', async (req, res) => {
  const { limit, searchTerm } = req.query;
  const posts = await Post.find({}, null, { limit: limit ?? Infinity });
  res.json(posts);
});

/**
 * @description Get a post
 * @param id The post unique identifier
 */
router.get('/:id', async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).send(`Post#${postId} does not exist.`);
  post.views += 1;
  await post.save();
  return res.json(post);
});

/**
 * @description Create a post
 * @param title
 * @param body
 */
router.post('/', auth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).send('Invalid parameters');
  await Post.create({
    userId: req.ctx.userId,
    title,
    body,
  });
  res.send('Post succesfully created.');
});

/**
 * @description Update a post
 * @param title
 * @param body
 */
router.patch('/:id', auth, async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).send(`Post#${postId} does not exists`);
  if (post.userId != req.ctx.userId)
    return res.status(400).send(`You do not have the rights to update Post#${postId}`);
  const { title, body } = req.body;
  if (title)
    post.title = title;
  if (body)
    post.body = body;
  post.save();
  res.json(post);
});

/**
 * @description Delete a post
 * @param id The post unique identifier
 */
router.delete('/:id', auth, async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).send(`Post#${postId} does not exists.`);
  if (post.userId != req.ctx.userId)
    return res.status(403).send(`You don't have the rights to delete this post.`);
  await post.deleteOne();
  res.send('Post has been deleted successfully.');
});

module.exports = router;