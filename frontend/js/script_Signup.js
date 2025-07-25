import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBNCeq_Yrw5w2vS9a3uRXHEF1YMEjHmNDs",
  authDomain: "surakshasetu-ef03d.firebaseapp.com",
  projectId: "surakshasetu-ef03d",
  storageBucket: "surakshasetu-ef03d.firebasestorage.app",
  messagingSenderId: "323260241840",
  appId: "1:323260241840:web:633e327b42bc0e0502e875",
  measurementId: "G-D9YCM3NC2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const signupMessage = document.getElementById('signupMessage');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    signupMessage.textContent = '';

    if (!username || !email || !password || !confirmPassword) {
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
      // 🔥 Sign up with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Optional: Save username to backend
      const token = await userCredential.user.getIdToken();

      await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      signupMessage.textContent = 'Signup successful!';
      signupMessage.className = 'signup-message success';
      window.location.href = 'login.html';
    } catch (error) {
      console.error(error);
      signupMessage.textContent = error.message || 'Signup failed.';
      signupMessage.className = 'signup-message error';
    }
  });
});