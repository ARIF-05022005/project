import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNCeq_Yrw5w2vS9a3uRXHEF1YMEjHmNDs",
  authDomain: "healthcare-ef03d.firebaseapp.com",
  projectId: "healthcare-ef03d",
  storageBucket: "healthcare-ef03d.firebasestorage.app",
  messagingSenderId: "323260241840",
  appId: "1:323260241840:web:633e327b42bc0e0502e875",
  measurementId: "G-D9YCM3NC2Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    loginMessage.textContent = '';

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      console.log('✅ Firebase Token:', token);

      // Save token to localStorage
      localStorage.setItem('token', token);

      loginMessage.textContent = 'Login successful!';
      loginMessage.className = 'login-message success';

      // ✅ Redirect to homepage
      window.location.href = 'indexMainpage.html';

    } catch (error) {
      console.error(error);
      loginMessage.textContent = error.message;
      loginMessage.className = 'login-message error';
    }
  });
});