// frontend/js/auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNCeq_Yrw5w2vS9a3uRXHEF1YMEjHmNDs",
  authDomain: "healthcare-ef03d.firebaseapp.com",
  projectId: "healthcare-ef03d",
  storageBucket: "healthcare-ef03d.appspot.com",
  messagingSenderId: "323260241840",
  appId: "1:323260241840:web:633e327b42bc0e0502e875",
  measurementId: "G-D9YCM3NC2Y"
};

initializeApp(firebaseConfig);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
let recaptchaVerifier;

document.addEventListener('DOMContentLoaded', () => {
  // Init invisible reCAPTCHA
  try {
    if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    recaptchaVerifier.render();
  } catch (e) {
    console.error("reCAPTCHA init failed:", e);
  }

  // SIGN UP
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('confirm-password').value;
      const username = document.getElementById('signup-username')?.value || email;
      const msg = document.getElementById('signupMessage');
      msg.textContent = '';
      if (password !== confirm) return msg.textContent = "Passwords don’t match";

      try {
        const uc = await createUserWithEmailAndPassword(auth, email, password);
        const token = await uc.user.getIdToken();
        await fetch('http://localhost:5050/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email, username, password })
        });
        msg.textContent = "✅ Account created! Redirecting…";
        setTimeout(() => window.location.href = 'indexMainpage.html', 1500);
      } catch (err) {
        msg.textContent = "❌ " + err.message;
      }
    });
  }

  // LOGIN - email/password
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const msg = document.getElementById('loginMessage');
      msg.textContent = '';
      try {
        const uc = await signInWithEmailAndPassword(auth, email, password);
        const token = await uc.user.getIdToken();
        localStorage.setItem('token', token);
        msg.textContent = "✅ Login successful! Redirecting…";
        setTimeout(() => window.location.href = 'indexMainpage.html', 1500);
      } catch (err) {
        msg.textContent = "❌ " + err.message;
      }
    });
  }

  // LOGIN — Google
  document.querySelectorAll('.google-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const token = await user.getIdToken();
        await fetch('http://localhost:5050/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: user.email, username: user.displayName || user.email })
        });
        localStorage.setItem('token', token);
        window.location.href = 'indexMainpage.html';
      } catch (err) {
        alert("❌ Google sign-in failed: " + err.message);
      }
    });
  });

  // LOGIN — Phone
  document.querySelectorAll('.phone-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      const phone = prompt("Enter phone (with country code):");
      if (!phone) return;
      try {
        const cr = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
        const code = prompt("Enter code sent to phone:");
        if (!code) return;
        const result = await cr.confirm(code);
        const user = result.user;
        const token = await user.getIdToken();
        await fetch('http://localhost:5050/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ username: user.phoneNumber })
        });
        localStorage.setItem('token', token);
        window.location.href = 'indexMainpage.html';
      } catch (err) {
        alert("❌ Phone sign-in failed: " + err.message);
      }
    });
  });

  // NAVBAR LOGIN/LOGOUT
  const loginDiv = document.querySelector('.login');
  onAuthStateChanged(auth, user => {
    if (loginDiv) {
      if (user) {
        loginDiv.textContent = 'Log Out';
        loginDiv.onclick = async () => {
          await signOut(auth);
          localStorage.clear();
          window.location.href = 'login.html';
        };
      } else {
        loginDiv.textContent = 'Log In';
        loginDiv.onclick = () => window.location.href = 'login.html';
      }
    }
  });
});