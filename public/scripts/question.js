(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (!urlParams.has('id'))
    return console.error('An id needs to be provided in the url.');
  const postId = urlParams.get('id');
  const post = await (await fetch(`/post?id=${postId}`)).json();
  const user = await (await fetch(`/user?id=${post.userId}`)).json();

  const questionTitle = document.getElementById('question-title');
  questionTitle.textContent = post.title;
  const questionMetadata = document.getElementById('question-metadata');
  questionMetadata.textContent = `Asked on ${new Date(post.created_at).toUTCString()} by ${user.fullName}. Viewed ${post.views} times`;
  const questionBody = document.getElementById('post-body');
  questionBody.textContent = post.body;
})();
