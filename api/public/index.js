
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  var interval = seconds / 31536000;
  if (interval > 1)
    return Math.floor(interval) + " year(s)";
  interval = seconds / 2592000;
  if (interval > 1)
    return Math.floor(interval) + " month(s)";
  interval = seconds / 86400;
  if (interval > 1)
    return Math.floor(interval) + " day(s)";
  interval = seconds / 3600;
  if (interval > 1)
    return Math.floor(interval) + " hour(s)";
  interval = seconds / 60;
  if (interval > 1)
    return Math.floor(interval) + " minute(s)";
  return Math.floor(seconds) + " second(s)";
}

(async () => {
  const res = await fetch('/posts', { method: 'get' });
  const data = await res.json();

  const postsContainer = document.querySelector('.postsContainer');
  for (post of data) {
    var fragment = document.createDocumentFragment();
    const li = document.createElement('li');
    fragment.appendChild(li);

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    li.appendChild(questionDiv);

    /* question stats */
    const questionStats = document.createElement('div');
    questionStats.className = 'question-stats';
    questionDiv.appendChild(questionStats);

    const answers = document.createElement('p');
    answers.textContent = `${post.answers} answers`;
    questionStats.appendChild(answers);

    const views = document.createElement('p');
    views.textContent = `${post.views} views`;
    questionStats.appendChild(views);

    /* question summary */

    const questionSummary = document.createElement('div');
    questionSummary.className = 'question-summary';
    questionDiv.appendChild(questionSummary);

    const questionTitle = document.createElement('h1');
    questionSummary.appendChild(questionTitle);

    const questionTitleLink = document.createElement('a');
    questionTitleLink.href = `/question.html?id=${post.id}`;
    questionTitleLink.textContent = post.title;
    questionTitle.appendChild(questionTitleLink);

    const questionUser = document.createElement('div');
    questionUser.className = 'question-user';
    questionSummary.appendChild(questionUser);

    const questionUserParagraphe = document.createElement('p');
    const userRes = await fetch(`/user?id=${post.userId}`, { method: 'get' });
    const user = await userRes.json();
    questionUserParagraphe.textContent = `${user.fullName} asked ${timeSince(post.created_at)} ago`;
    questionUser.appendChild(questionUserParagraphe);

    postsContainer.append(fragment);
  }
})();
