const express = require('express');
const app = express();
const DB = require('./db');

const PORT = 8080;

app.get('/posts', (req, res) => {
  res.send(DB.posts);
});

app.get('/post', (req, res) => {
  const postId = parseInt(req.query.id);
  const post = DB.posts.find(post => (post.id === postId));
  res.send(post);
});

app.listen(PORT, () => { console.log(`Server running on port: ${PORT}`); });
