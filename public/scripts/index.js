let currentUser = null;

const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

(async () => {
  const resCurrentUser = await fetch('/api/currentUser');
  if (resCurrentUser.ok)
    currentUser = await resCurrentUser.json();
  await loadNextPosts();
})();


document.querySelector('#load-more-btn').addEventListener('click', async () => {
  await loadNextPosts();
});

let pageIdx = 0;
const PostLimit = 10;

async function loadNextPosts() {
  const url = new URL('api/post', window.location.origin);
  url.searchParams.append('limit', PostLimit);
  url.searchParams.append('pageIdx', pageIdx);
  if (searchTerm)
    url.searchParams.append('searchTerm', searchTerm);
  const postsRes = await fetch(url);
  if (!postsRes.ok)
    return;
  const { posts, totalNbPosts } = await postsRes.json();
  generatePosts(posts);

  // Disable "load more" button if there are no more posts to be loaded
  if ((pageIdx * PostLimit + PostLimit) >= totalNbPosts)
    document.querySelector('.load-more-container').style.display = 'none';
  pageIdx += 1;
}

function generatePosts(posts) {
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
          <div class="title-container">
            <h1><a href="/question?id=${post._id}">${post.title}</a></h1>
          </div>
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
}

function generateControlsTemplate(postId) {
  return `
      <a href="/ask/update?id=${postId}" class="question-update-control"><i class="fa-solid fa-pen-to-square"></i></a>
  `;
}
