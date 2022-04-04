
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
  if (res.ok)
    window.location.replace(window.location.origin);
  else
    alert('You must be logged in to do this.');
}

document.querySelector("#btn-submit").addEventListener("click", async (event) => {
  event.preventDefault();
  const postTitle = document.getElementById('question-title').value;
  const postBody = document.getElementById('question-body').value;
  createPost(postTitle, postBody);
}, false);
