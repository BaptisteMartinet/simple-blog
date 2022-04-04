function generateControlsTemplate(postId)
{
  return `
      <a href="/ask/update?id=${postId}" class="question-update-control"><i class="fa-solid fa-pen-to-square"></i></a>
  `;
}

(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get('searchTerm');

  const url = new URL('api/post', window.location.origin);
  if (searchTerm)
    url.searchParams.append('searchTerm', searchTerm);
  const postsRes = await fetch(url);
  if (!postsRes.ok)
    return;
  const posts = await postsRes.json();

  const resCurrentUser = await fetch('/api/currentUser');
  const currentUser = resCurrentUser.ok ? await resCurrentUser.json() : null;

  const postsContainer = document.querySelector('.postsContainer');
  for (post of posts) {
    const template = `
    <li>
      <div class="question">
        <div class="question-stats">
          <p>${post.comments.length} answers</p>
          <p>${post.views} views</p>
        </div>
        <div class="question-summary">
          <h1><a href="/question?id=${post._id}">${post.title}</a></h1>
          <div class="question-user">
            ${post.user?._id === currentUser?._id ? generateControlsTemplate(post._id) : ''}
            <p>${post.user?.fullName ?? 'Unknown'} asked ${timeSince(post.createdAt)} ago</p>
          </div>
        </div>
      </div>
    </li>
    `;
    postsContainer.innerHTML += template;
  }
})();
