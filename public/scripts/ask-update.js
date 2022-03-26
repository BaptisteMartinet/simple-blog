
(async () => {
  const questionTitle = document.getElementById('question-title');
  const questionBody = document.getElementById('question-body');

  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('id'))
    return;
  const postId = urlParams.get('id');

  const resPost = await fetch(`/api/post?id=${postId}`);
  if (!resPost.ok)
    return;
  const post = await resPost.json();

  questionTitle.value = post.title;
  questionBody.value = post.body;
})();

async function updatePost(postId, args)
{
  const { title, body } = args;
  if (!title || !body)
    return console.log('Title and body must be provided.');
  const res = await fetch(`/api/post?id=${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      body
    }),
  });
  if (res.ok)
    document.location.replace(`/question?id=${postId}`);
  else
    alert('Something went wrong while updating post.');
}

document.querySelector("#btn-submit").addEventListener("click", async (event) => {
  event.preventDefault();
  const title = document.getElementById('question-title').value;
  const body = document.getElementById('question-body').value;

  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('id'))
    return;
  const postId = urlParams.get('id');
  updatePost(postId, { title, body} );
}, false);

async function deletePost(postId)
{
  const res = await fetch(`/api/post?id=${postId}`, {
    method: 'DELETE',
  });
  if (res.ok)
    window.location.replace('/');
  else
    alert('Something went wrong while deleting the post.');
}

document.querySelector("#btn-delete").addEventListener("click", async (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('id'))
    return;
  const postId = urlParams.get('id');
  deletePost(postId);
}, false);
