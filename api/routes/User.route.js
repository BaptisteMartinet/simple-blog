const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validateEmail } = require('../utils/email');

/**
 * @description Get a specific user
 * @param id The user unique identifier
 */
router.get('/:id', async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findById(userId);
  if (!user)
    return res.status(404).send(`User#${userId} not found.`);
  const trimmedUser = { ...user._doc };
  delete trimmedUser.email;
  delete trimmedUser.password;
  return res.json(trimmedUser);
});


function ensureUserArgs(args) {
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
router.post('/register', async (req, res) => {
  const args = req.body;
  try {
    ensureUserArgs(args);
  } catch (e) {
    return res.status(400).send(e.message);
  }
  const { fullName, email, password } = args;
  if (await User.exists({ email }))
    return res.status(409).send('User already exists.');
  await User.create({
    fullName,
    email,
    password: bcrypt.hashSync(password, 10),
  });
  res.status(201).send('Account successfully created');
});

/**
 * @description Log the user in by returning its unique token in a cookie attached to the request.
 * Every next query requiring authentification will need this token to authenticate the user.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user)
    return res.status(404).send(`User not found`);
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).send(`Invalid credentials`);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
  res.cookie('x-access-token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true });
  return res.send('Successfully logged in.')
});

module.exports = router;
