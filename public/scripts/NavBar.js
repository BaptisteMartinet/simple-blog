
(async () => {
  const userNameDisplay = document.getElementById('nav-username-display');
  const authentificationBtns = document.getElementById('nav-authentification-btns');

  const res = await fetch('/api/currentUser');
  if (!res.ok) {
    authentificationBtns.style.display = 'block';
    return;
  }
  const user = await res.json();
  userNameDisplay.textContent = user.fullName;
  userNameDisplay.style.display = 'block';
})();

document.querySelector('.searchBox').addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = document.getElementById('searchBox').value;
  window.location.replace(`/?searchTerm=${searchTerm}`);
});
