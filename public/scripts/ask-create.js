
async function createPost(title, body)
{
  if (!title || !body)
    return console.error('Title and Body must not be empty');
  const res = await fetch('/api/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      body
    }),
  });
  if (!res.ok)
    return alert('You must be logged in to do this.');
  const post = await res.json();
  window.location.replace(`/question?id=${post._id}`);
}

document.querySelector('#btn-submit').addEventListener('click', async (event) => {
  event.preventDefault();
  const postTitle = document.getElementById('question-title').value;
  const postBody = document.getElementById('question-body').value;
  createPost(postTitle, postBody);
}, false);
