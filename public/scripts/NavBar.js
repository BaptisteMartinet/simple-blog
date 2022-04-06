/**
 * @description Entry point of the navbar script.
 * It checks if the user is registered and displays
 * the right button in the navbar accordingly.
 */
(async () => {
  const userNameDisplay = document.getElementById('nav-username-display');
  const authentificationBtns = document.getElementById('nav-authentification-btns');
  const logoutBtn = document.getElementById('logout-btn');

  const res = await fetch('/api/currentUser');
  if (!res.ok) {
    authentificationBtns.style.display = 'block';
    return;
  }
  const user = await res.json();
  userNameDisplay.textContent = user.fullName;
  userNameDisplay.style.display = 'block';
  logoutBtn.style.display = 'block';
})();

document.querySelector('#logout-btn').addEventListener('click', async () => {
  const res = await fetch('/api/logout');
  if (!res.ok)
    return;
  window.location.reload();
});
