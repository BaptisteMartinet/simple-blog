function generateControlsTemplate(postId)
{
  return `
      <a href="/ask/update?id=${postId}" class="question-update-control"><i class="fa-solid fa-pen-to-square"></i></a>
  `;
}

(async () => {
  const res = await fetch('/api/posts');
  if (!res.ok)
    return;
  const posts = await res.json();

  const resCurrentUser = await fetch('/api/currentUser');
  const currentUser = resCurrentUser.ok ? await resCurrentUser.json() : null;

  const postsContainer = document.querySelector('.postsContainer');
  for (post of posts) {
    const user = await (await fetch(`/api/user?id=${post.userId}`)).json();
    const template = `
    <li>
      <div class="question">
        <div class="question-stats">
          <p>${post.answers} answers</p>
          <p>${post.views} views</p>
        </div>
        <div class="question-summary">
          <h1><a href="/question?id=${post.id}">${post.title}</a></h1>
          <div class="question-user">
            ${post.userId === currentUser?.id ? generateControlsTemplate(post.id) : ''}
            <p>${user?.fullName ?? 'Unknown'} asked ${timeSince(post.created_at)} ago</p>
          </div>
        </div>
      </div>
    </li>
    `;
    postsContainer.innerHTML += template;
  }
})();
