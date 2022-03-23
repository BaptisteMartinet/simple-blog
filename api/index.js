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

/* POSTS */

app.get('/posts', (req, res) => {
  const limit = req.query.limit || Infinity;
  res.status(200).json(DB.posts.slice(0, limit));
});

app.get('/post', (req, res) => {
  const postId = parseInt(req.query.id);
  if (!postId && postId !== 0)
    return res.status(400).send(`Invalid post id`);
  const post = DB.posts.find(post => (post.id === postId));
  if (!post)
    return res.status(404).send(`Post#${postId} does not exist.`)
  return res.status(200).json(post);
});

app.post('/post', auth, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).send('Invalid parameters');
  const currentDate = new Date().getTime();
  const newPost = {
    id: uuidv4(),
    userId: req.jwtPayload.userId,
    title,
    body,
    created_at: currentDate,
    updated_at: currentDate,
  };
  DB.posts.push(newPost);
  res.status(200).send('Post succesfully created.');
});

// TODO add patch endpoint to update posts

/* USERS */

app.get('/users', (req, res) => {
  res.status(200).json(DB.users);
});

function checkUserArgs(args)
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
    checkUserArgs(args);
  } catch(e) {
    return res.status(400).send(e.message);
  }
  const { email, password, ...rest } = args;
  if (DB.users.some(user => (user.email === email)))
    return res.status(409).send('User already exists.');
  const userId = uuidv4();
  const jwtToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
  const encryptedPassword = bcrypt.hashSync(password, 10);
  const createdUser = {
    id: userId,
    email,
    password: encryptedPassword,
    token: jwtToken,
    ...rest,
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
  return res.status(200).json(user);
});

app.listen(PORT, () => { console.log(`Server running on port: ${PORT}`); });
