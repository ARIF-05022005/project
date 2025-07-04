document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('loginPassword');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');

  // Toggle show/hide password (only if togglePassword element exists)
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye-slash');
    });
  }

  // Handle login form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();

    loginMessage.textContent = ''; // Clear previous

    if (!email || !password) {
      loginMessage.textContent = 'Please enter both email and password.';
      loginMessage.className = 'login-message error';
      return;
    }

    if (!validateEmail(email)) {
      loginMessage.textContent = 'Please enter a valid email address.';
      loginMessage.className = 'login-message error';
      return;
    }

    try {
      const res = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        loginMessage.textContent = 'Login successful!';
        loginMessage.className = 'login-message success';
        window.location.href = 'indexMainpage.html';
      } else {
        loginMessage.textContent = data.msg || 'Login failed.';
        loginMessage.className = 'login-message error';
      }
    } catch (err) {
      console.error(err);
      loginMessage.textContent = 'Something went wrong.';
      loginMessage.className = 'login-message error';
    }
  });

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
});