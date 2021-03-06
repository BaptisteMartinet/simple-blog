const express = require('express');
const router = express.Router();
const auth = require('../midlewares/auth');
const { Post } = require('../models');

/**
 * @description Return all the posts stored in DB
 * @param pageIdx Specify a page index
 * @param limit Limit the number of posts returned
 * @param searchTerm Filter posts with a search term (case insensitive)
 */
router.get('/', async (req, res) => {
  const { pageIdx, limit, searchTerm } = req.query;
  const filter = {};
  if (searchTerm)
    filter['title'] = { $regex: searchTerm, $options: 'i' };
  const options = {
    sort: { createdAt: 'desc' },
    limit: limit ?? Infinity,
    ...(pageIdx && limit ? { skip: pageIdx * limit } : null),
  };
  const totalNbPosts = await Post.count(filter);
  const posts = await Post.find(filter, null, options).populate([
    {
      path: 'user',
      model: 'User',
    },
    {
      path: 'comments',
      model: 'Comment',
      populate: { path: 'user', model: 'User' },
    },
  ]);
  res.json({ posts, totalNbPosts });
});

/**
 * @description Get a post
 * @param id The post unique identifier
 */
router.get('/:id', async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findById(postId).populate([
    { path: 'user', model: 'User' },
    {
      path: 'comments',
      model: 'Comment',
      populate: { path: 'user', model: 'User' },
    },
  ]);
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
  const post = await Post.create({
    user: req.ctx.userId,
    title,
    body,
  });
  res.json(post);
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
  if (post.user != req.ctx.userId)
    return res.status(400).send(`You do not have the rights to update Post#${postId}`);
  const { title, body } = req.body;
  if (title)
    post.title = title;
  if (body)
    post.body = body;
  await post.save();
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
  if (post.user != req.ctx.userId)
    return res.status(403).send(`You don't have the rights to delete this post.`);
  await post.deleteOne();
  res.send('Post has been deleted successfully.');
});

module.exports = router;