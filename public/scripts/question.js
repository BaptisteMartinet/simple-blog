async function generateComments(postId) {
  const commentsRes = await fetch(`/api/comment?postId=${postId}`);
  if (!commentsRes.ok)
    return;
  const comments = await commentsRes.json();
  const commentList = document.querySelector('.comments-container');
  for (const comment of comments) {
    const commentTemplate = `
      <li class="comment-container">
        <div class="comment-body">
          <p>${comment.body}</p>
        </div>
        <div class="comment-user">
          <p>Answered yesterday by Baptiste Martinet</p>
        </div>
      </li>
    `;
    commentList.innerHTML += commentTemplate;
  }
}

(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (!urlParams.has('id'))
    return console.error('An id needs to be provided in the url.');
  const postId = urlParams.get('id');

  generateComments(postId); //Comments will be loaded asynchronously

  const postRes = await fetch(`/api/post/${postId}`);
  if (!postRes.ok)
    return;
  const post = await postRes.json();
  const userRes = await fetch(`/api/user/${post.userId}`);
  if (!userRes.ok)
    return;
  const user = await userRes.json();

  const questionTitle = document.getElementById('question-title');
  questionTitle.textContent = post.title;
  const questionMetadata = document.getElementById('question-metadata');
  questionMetadata.textContent = `Asked on ${new Date(post.createdAt).toUTCString()} by ${user.fullName}. Viewed ${post.views} times`;
  const questionBody = document.getElementById('post-body');
  questionBody.innerText = post.body;
})();

async function createComment(args) {
  if (!args.body)
    return;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (!urlParams.has('id'))
    return console.error('An id needs to be provided in the url.');
  const postId = urlParams.get('id');
  const res = await fetch(`/api/comment?postId=${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (res.ok)
    window.location.reload();
  else
    alert('Something went wrong when creating comment.')
}

document.querySelector('#btn-submit').addEventListener('click', (e) => {
  e.preventDefault();
  const body = document.querySelector('#comment-form-body').value;
  createComment({ body });
});
