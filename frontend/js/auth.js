import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let recaptchaVerifier;

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM loaded");

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => console.log("✅ Recaptcha verified:", response)
    });
    recaptchaVerifier.render().then(widgetId => {
      console.log("✅ reCAPTCHA widget rendered:", widgetId);
    });
  } catch (e) {
    console.error("❌ Failed to initialize reCAPTCHA:", e);
  }

  // SIGN UP
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const msg = document.getElementById('signupMessage');
      msg.textContent = '';

      if (password !== confirmPassword) {
        msg.textContent = "Passwords do not match";
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        msg.textContent = "✅ Account created! Redirecting...";
        setTimeout(() => window.location.href = "indexMainpage.html", 1500);
      } catch (error) {
        msg.textContent = "❌ " + error.message;
        console.error(error);
      }
    });
  }

  // LOGIN
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const msg = document.getElementById('loginMessage');
      msg.textContent = '';

      try {
        await signInWithEmailAndPassword(auth, email, password);
        msg.textContent = "✅ Login successful! Redirecting...";
        setTimeout(() => window.location.href = "indexMainpage.html", 1500);
      } catch (error) {
        msg.textContent = "❌ Login failed: " + error.message;
        console.error(error);
      }
    });
  }

  // Google login
  document.querySelectorAll('.google-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = "indexMainpage.html";
      } catch (error) {
        alert("❌ Google sign in failed: " + error.message);
        console.error(error);
      }
    });
  });

  // Phone login
  document.querySelectorAll('.phone-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      console.log("ℹ️ Phone login clicked");

      const phoneNumber = prompt("Enter phone number with country code (e.g. +91XXXXXXXXXX):");
      if (!phoneNumber) return;

      try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        const code = prompt("Enter the verification code you received:");
        if (!code) return;
        await confirmationResult.confirm(code);
        window.location.href = "indexMainpage.html";
      } catch (error) {
        alert("❌ Phone sign in failed: " + error.message);
        console.error(error);
      }
    });
  });

  // Nav login/logout
  const loginDiv = document.querySelector('.login');
  if (loginDiv) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        loginDiv.textContent = 'Log Out';
        loginDiv.onclick = async () => {
          await signOut(auth);
          window.location.href = 'login.html';
        };
      } else {
        loginDiv.textContent = 'Log In';
        loginDiv.onclick = () => window.location.href = 'login.html';
      }
    });
  }
});
