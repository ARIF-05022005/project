document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');

  // Toggle show/hide password
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // Fake form validation & login
  loginForm.addEventListener('submit', (e) => {
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

    // Fake success
    loginMessage.textContent = 'Login successful! (This is fake; backend coming soon)';
    loginMessage.className = 'login-message success';

    // Later: send to backend here
  });

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
});
