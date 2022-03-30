async function generateComments(postId, user) {
  const commentsRes = await fetch(`/api/comment?postId=${postId}`);
  if (!commentsRes.ok)
    return;
  const comments = await commentsRes.json();

  const commentSection = document.getElementById('comment-section-fieldset');
  if (comments.length > 0)
    commentSection.style.display = 'block';
  const commentList = document.querySelector('.comments-container');
  for (const comment of comments) {
    const commentTemplate = `
      <li class="comment-container">
        <div class="comment-body">
          <p>${comment.body}</p>
        </div>
        <div class="comment-user">
          <p>Answered ${new Date(comment.createdAt).toLocaleString()} by ${user?.fullName ?? 'Unknown'}</p>
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

  const postRes = await fetch(`/api/post/${postId}`);
  if (!postRes.ok)
    return;
  const post = await postRes.json();
  const userRes = await fetch(`/api/user/${post.userId}`);
  const user = await userRes.json();

  generateComments(postId, user); //Comments will be loaded asynchronously

  const questionTitle = document.getElementById('question-title');
  questionTitle.textContent = post.title;
  const questionMetadata = document.getElementById('question-metadata');
  questionMetadata.textContent = `Asked on ${new Date(post.createdAt).toLocaleString()} by ${user?.fullName ?? 'Unknown'}. Viewed ${post.views} times`;
  const questionBody = document.getElementById('post-body');
  questionBody.innerHTML = post.body;
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
