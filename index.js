require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const express = require('express');
const auth = require('./midleware/auth');
const app = express();
const DB = require('./database');
const { validateEmail } = require('./utils/email');

const PORT = process.env.PORT || 8080;

/* CONFIG */

app.use(express.json());

app.use(express.static('public'));

/* POSTS */

app.get('/posts', (req, res) => {
  const limit = req.query.limit || Infinity;
  res.status(200).json(DB.posts.slice(0, limit));
});

app.get('/post', (req, res) => {
  const { id: postId } = req.query;
  if (!postId)
    return res.status(400).send(`Invalid post id`);
  const post = DB.posts.find(post => (post.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exist.`);
  post.views += 1;
  return res.status(200).json(post);
});

app.post('/post', auth, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).send('Invalid parameters');
  const currentDate = Date.now();
  const newPost = {
    id: uuidv4(),
    userId: req.jwtPayload.userId,
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

app.patch('/post', auth, (req, res) => {
  const { id: postId } = req.query;
  if (!postId)
    return res.status(400).send('Invalid id.');
  const post = DB.posts.find(p => (p.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exists`);
  if (post.userId != req.jwtPayload.userId)
    return res.status(400).send(`You do not have the rights to update Post#${postId}`)
  const { title, body } = req.body;
  if (title)
    post.title = title;
  if (body)
    post.body = body;
  post.updated_at = Date.now();
  res.status(200).json(post);
});

/* USERS */

app.get('/users', (req, res) => {
  res.status(200).json(DB.users);
});

app.get('/user', (req, res) => {
  const { id: userId } = req.query;
  if (!userId)
    return res.status(400).send('Invalid id.');
  const user = DB.users.find(u => (u.id === userId));
  if (!user)
    return res.status(404).send(`User#${userId} not found.`);
  const trimmedUser = { ...user };
  delete trimmedUser.token;
  delete trimmedUser.password;
  return res.status(200).json(trimmedUser);
});

function ensureUserArgs(args)
{
  const { fullName, email, password } = args;
  if (!fullName || !email || !password)
    throw new Error('Invalid arguments');
  if (!validateEmail(email))
    throw new Error('Invalid email adress');
}

app.post('/register', (req, res) => {
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
    token: null,
  };
  DB.users.push(createdUser);
  res.status(201).send('Account successfully created');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => (u.email === email));
  if (!user)
    return res.status(404).send(`User not found`);
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).send(`Invalid credentials`);
  user.token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
  res.cookie('access-token', user.token, { expires: new Date(Date.now() + 20000) });
  return res.status(200).json(user);
});

app.listen(PORT, () => { console.log(`Server running on port: ${PORT}`); });
