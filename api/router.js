const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const auth = require('./midleware/auth');
const { validateEmail } = require('./utils/email');
const DB = require('./database');

const router = express.Router();

// POSTS

router.get('/posts', (req, res) => {
  const limit = req.query.limit || Infinity;
  res.status(200).json(DB.posts.slice(0, limit));
});

router.get('/post', (req, res) => {
  const { id: postId } = req.query;
  if (!postId)
    return res.status(400).send(`Invalid post id`);
  const post = DB.posts.find(post => (post.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exist.`);
  post.views += 1;
  return res.status(200).json(post);
});

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
    answers: 0,
    created_at: currentDate,
    updated_at: currentDate,
  };
  DB.posts.push(newPost);
  res.status(200).send('Post succesfully created.');
});

router.patch('/post', auth, (req, res) => {
  const { id: postId } = req.query;
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
  res.status(200).json(post);
});

router.delete('/post', auth, (req, res) => {
  const { id: postId } = req.query;
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
  return res.status(200).send('Post has been deleted successfully.');
});

// Comments

router.get('/comments', (req, res) => {
  res.status(200).json(DB.comments);
});

router.post('/comment', auth, (req, res) => {
  const { id: postId } = req.query;
  const { body } = req.body;
  const { userId } = req.ctx;
  if (!postId)
    return res.status(400).send('Invalid post id');
  if (!body)
    return res.status(400).send('Invalid body.');
  const newComment = {
    id: uuidv4(),
    postId,
    userId,
    body,
  };
  DB.comments.push(newComment);
  return res.status(200).send('Comment successfully created.');
});

// USERS

router.get('/users', (req, res) => {
  res.status(200).json(DB.users);
});

router.get('/user', (req, res) => {
  const { id: userId } = req.query;
  if (!userId)
    return res.status(400).send('Invalid id.');
  const user = DB.users.find(u => (u.id === userId));
  if (!user)
    return res.status(404).send(`User#${userId} not found.`);
  const trimmedUser = { ...user };
  delete trimmedUser.password;
  return res.status(200).json(trimmedUser);
});

router.get('/currentUser', auth, (req, res) => {
  const { userId } = req.ctx;
  const user = DB.users.find(u => (u.id === userId));
  if (!user)
    return res.status(404).send(`User#${userId} does not exists.`);
  return res.status(200).json(user);
});

function ensureUserArgs(args)
{
  const { fullName, email, password } = args;
  if (!fullName || !email || !password)
    throw new Error('Invalid arguments');
  if (!validateEmail(email))
    throw new Error('Invalid email adress');
}

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

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => (u.email === email));
  if (!user)
    return res.status(404).send(`User not found`);
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).send(`Invalid credentials`);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
  res.cookie('x-access-token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true });
  return res.status(200).json(user);
});

module.exports = router;
