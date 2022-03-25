
(async () => {
  const userNameDisplay = document.getElementById('nav-username-display');
  const authentificationBtns = document.getElementById('nav-authentification-btns');

  const res = await fetch('/api/currentUser');
  if (!res.ok)
    return;
  const user = await res.json();
  userNameDisplay.textContent = user.fullName;

  authentificationBtns.style.display = 'none';
  userNameDisplay.style.display = 'block';
})();