
async function createPost(title, body)
{
  if (!title || !body)
    return console.error('Title and Body must not be empty')
  await fetch('/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO access token needed here
    },
    body: JSON.stringify({
      title,
      body
    }),
  });
}

document.querySelector("#btn-submit").addEventListener("click", async (event) => {
  event.preventDefault();
  const postTitle = document.getElementById('question-title').value;
  const postBody = document.getElementById('question-body').value;
  createPost(postTitle, postBody);
}, false);
