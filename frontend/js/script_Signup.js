document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const signupMessage = document.getElementById('signupMessage');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);

    signupMessage.textContent = '';

    if (!name || !email || !password || !confirmPassword) {
      signupMessage.textContent = 'Please fill in all fields.';
      signupMessage.className = 'signup-message error';
      return;
    }

    if (password !== confirmPassword) {
      signupMessage.textContent = 'Passwords do not match.';
      signupMessage.className = 'signup-message error';
      return;
    }

    try {
      const res = await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ sending username instead of name
        body: JSON.stringify({ username: name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        signupMessage.textContent = 'Signup successful!';
        signupMessage.className = 'signup-message success';
        window.location.href = 'login.html';
      } else {
        signupMessage.textContent = data.msg || 'Signup failed.';
        signupMessage.className = 'signup-message error';
      }
    } catch (err) {
      console.error(err);
      signupMessage.textContent = 'Something went wrong.';
      signupMessage.className = 'signup-message error';
    }
  });
});
