const express = require('express');
const router = express.Router();
const auth = require('../midlewares/auth');
const { User } = require('../models');
const { PostRouter, CommentRouter, UserRouter } = require('./index');

router.use('/post', PostRouter);
router.use('/comment', CommentRouter);
router.use('/user', UserRouter);

/**
 * @description Return the authentified user
 */
 router.get('/currentUser', auth, async (req, res) => {
  const { userId } = req.ctx;
  const user = await User.findById(userId);
  if (!user)
    return res.status(404).send(`User#${userId} does not exists.`);
  return res.json(user);
});

/**
 * @description Logout the user by deleting its authentification token
 */
router.get('/logout', auth, async (req, res) => {
  res.clearCookie('x-access-token').send('Successfully logged out.');
});

module.exports = router;
