(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (!urlParams.has('id'))
    return console.error('An id needs to be provided in the url.');
  const postId = urlParams.get('id');

  const res = await fetch(`/post?id=${postId}`);
  const post = await res.json();
  console.log(post);
})();
