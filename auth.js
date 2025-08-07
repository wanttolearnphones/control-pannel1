// Toggle between login and signup
document.getElementById('showLogin').onclick = () => {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
};

document.getElementById('showSignup').onclick = () => {
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
};

// Sign Up Logic
document.getElementById('signupForm').onsubmit = (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;

  if (username && password) {
    localStorage.setItem(`user-${username}`, JSON.stringify({ username, password }));
    alert('Sign up successful! You can now log in.');
    document.getElementById('showLogin').click();
  }
};

// Log In Logic
document.getElementById('loginForm').onsubmit = (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const user = JSON.parse(localStorage.getItem(`user-${username}`));
  if (user && user.password === password) {
    localStorage.setItem('loggedInUser', username);
    window.location.href = 'index.html'; // redirect to main app
  } else {
    alert('Incorrect username or password');
  }
};
