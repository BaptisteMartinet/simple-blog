const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const auth = require('./midleware/auth');
const { validateEmail } = require('./utils/email');
const DB = require('./database');

const router = express.Router();

// POSTS

/**
 * @description Return all the posts stored in DB
 * @param limit Limit the number of posts returned
 * @param searchTerm Filter posts with a search term
 */
router.get('/posts', (req, res) => {
  const { limit, searchTerm } = req.query;
  let posts = [ ...DB.posts ];
  if (searchTerm)
    posts = posts.filter(p => (
      p.title.toLowerCase().includes(searchTerm.toLowerCase()))
      || p.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  if (limit)
    posts.splice(0, limit);
  res.json(posts);
});

/**
 * @description Get a post
 * @param id The post unique identifier
 */
router.get('/post/:id', (req, res) => {
  const { id: postId } = req.params;
  if (!postId)
    return res.status(400).send(`Invalid post id`);
  const post = DB.posts.find(post => (post.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exist.`);
  post.views += 1;
  return res.json(post);
});

/**
 * @description Create a post
 * @param title
 * @param body
 */
router.post('/post', auth, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).send('Invalid parameters');
  const currentDate = Date.now();
  const newPost = {
    id: uuidv4(),
    userId: req.ctx.userId,
    title,
    body,
    views: 0,
    comments: 0,
    created_at: currentDate,
    updated_at: currentDate,
  };
  DB.posts.push(newPost);
  res.send('Post succesfully created.');
});

/**
 * @description Update a post
 * @param title
 * @param body
 */
router.patch('/post/:id', auth, (req, res) => {
  const { id: postId } = req.params;
  if (!postId)
    return res.status(400).send('Invalid id.');
  const post = DB.posts.find(p => (p.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exists`);
  if (post.userId != req.ctx.userId)
    return res.status(400).send(`You do not have the rights to update Post#${postId}`)
  const { title, body } = req.body;
  if (title)
    post.title = title;
  if (body)
    post.body = body;
  post.updated_at = Date.now();
  res.json(post);
});

/**
 * @description Delete a post
 * @param id The post unique identifier
 */
router.delete('/post/:id', auth, (req, res) => {
  const { id: postId } = req.params;
  if (!postId)
    return res.status(400).send('Invalid id.');
  const post = DB.posts.find(p => (p.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exists.`);
  if (post.userId != req.ctx.userId)
    return res.status(403).send(`You don't have the rights to delete this post.`);
  const postIdx = DB.posts.indexOf(post);
  if (postIdx < 0)
    return res.status(503).send('An error has occured.');
  DB.posts.splice(postIdx, 1);
  return res.send('Post has been deleted successfully.');
});

// Comments

/**
 * @description Get all comments
 * @param postId Get comments of a specific post
 * @param limit Limit the number of returned posts
 */
router.get('/comments', (req, res) => {
  const { postId, limit } = req.query;
  let comments = [ ...DB.comments ];
  if (postId)
    comments = comments.filter(c => (c.postId === postId));
  if (limit)
    comments.splice(0, limit);
  res.json(comments);
});

/**
 * @description Create a comment
 * @param body The comment body
 */
router.post('/comment', auth, (req, res) => {
  const { postId } = req.query;
  const { body } = req.body;
  const { userId } = req.ctx;
  if (!postId)
    return res.status(400).send('Missing postId param');
  if (!body)
    return res.status(400).send('Invalid body.');
  const post = DB.posts.find(p => (p.id === postId));
  if (!post)
    return res.status(404).send('Post does not exists');
  const newComment = {
    id: uuidv4(),
    postId,
    userId,
    body,
  };
  DB.comments.push(newComment);
  post.comments += 1;
  return res.send('Comment successfully created.');
});

// USERS

/**
 * @description Get a specific user
 * @param id The user unique identifier
 */
router.get('/user/:id', (req, res) => {
  const { id: userId } = req.params;
  if (!userId)
    return res.status(400).send('Invalid id.');
  const user = DB.users.find(u => (u.id === userId));
  if (!user)
    return res.status(404).send(`User#${userId} not found.`);
  const trimmedUser = { ...user };
  delete trimmedUser.email;
  delete trimmedUser.password;
  return res.json(trimmedUser);
});

/**
 * @description Return the authentified user
 */
router.get('/currentUser', auth, (req, res) => {
  const { userId } = req.ctx;
  const user = DB.users.find(u => (u.id === userId));
  if (!user)
    return res.status(404).send(`User#${userId} does not exists.`);
  return res.json(user);
});

function ensureUserArgs(args)
{
  const { fullName, email, password } = args;
  if (!fullName || !email || !password)
    throw new Error('Invalid arguments');
  if (!validateEmail(email))
    throw new Error('Invalid email adress');
}

/**
 * @description Register a new user
 * @param fullName
 * @param email
 * @param password
 */
router.post('/register', (req, res) => {
  const args = req.body;
  try {
    ensureUserArgs(args);
  } catch(e) {
    return res.status(400).send(e.message);
  }
  const { fullName, email, password } = args;
  if (DB.users.some(user => (user.email === email)))
    return res.status(409).send('User already exists.');
  const createdUser = {
    id: uuidv4(),
    fullName,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  DB.users.push(createdUser);
  res.status(201).send('Account successfully created');
});

/**
 * @description Log the user in by returning its unique token in a cookie attached to the request.
 * Every next query requiring authentification will need this token to authenticate the user.
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => (u.email === email));
  if (!user)
    return res.status(404).send(`User not found`);
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).send(`Invalid credentials`);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
  res.cookie('x-access-token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true });
  return res.json(user);
});

module.exports = router;
