async function login(args)
{
  if (!args.email || !args.password)
    return console.error('Args must not be empty');
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (res.ok)
    window.location.replace('/');
  else
    alert('Invalid credentials');
}

document.querySelector("#btn-submit").addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login({ email, password });
}, false);
