
async function register(args)
{
  if (!args.fullName || !args.email || !args.password)
    return console.error('Args must be filled')
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (res.ok)
    document.location.replace('/login');
  else
    alert('Something went wrong');
}

document.querySelector("#btn-submit").addEventListener("click", async (event) => {
  event.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  register({ fullName, email, password });
}, false);
