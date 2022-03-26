(async () => {
  const res = await fetch('/api/posts', { method: 'get' });
  const data = await res.json();

  const postsContainer = document.querySelector('.postsContainer');
  for (post of data) {
    const user = await (await fetch(`/api/user?id=${post.userId}`, { method: 'get' })).json();
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
            <div id="question-controls">
              <a href="/"><i class="fa-solid fa-pen-to-square"></i></a>
              <a href="/"><i class="fa-solid fa-trash"></i></a>
            </div>
            <p>${user?.fullName ?? 'unknown'} asked ${timeSince(post.created_at)} ago</p>
          </div>
        </div>
      </div>
    </li>
    `;
    postsContainer.innerHTML += template;
  }
})();
