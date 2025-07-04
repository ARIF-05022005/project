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

// === Your Firebase config ===
const firebaseConfig = {
  apiKey: "AIzaSyBNCeq_Yrw5w2vS9a3uRXHEF1YMEjHmNDs",
  authDomain: "healthcare-ef03d.firebaseapp.com",
  projectId: "healthcare-ef03d",
  storageBucket: "healthcare-ef03d.appspot.com",
  messagingSenderId: "323260241840",
  appId: "1:323260241840:web:633e327b42bc0e0502e875",
  measurementId: "G-D9YCM3NC2Y"
};

// === Initialize Firebase ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ Auth loaded:", auth);

const googleProvider = new GoogleAuthProvider();

// === Initialize reCAPTCHA verifier ===
let recaptchaVerifier;
function initRecaptcha() {
  if (!recaptchaVerifier) {
    console.log("ℹ️ Initializing RecaptchaVerifier...");
    recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: (response) => console.log("✅ Recaptcha verified:", response)
    }, auth);
    recaptchaVerifier.render().then((widgetId) => {
      console.log("✅ Recaptcha widget rendered with ID:", widgetId);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ✅ Initialize reCAPTCHA once after DOM is loaded
  initRecaptcha();

  // === SIGN UP with email ===
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
        setTimeout(() => window.location.href = "/indexMainpage.html", 1500);
      } catch (error) {
        msg.textContent = "❌ " + error.message;
        console.error(error);
      }
    });
  }

  // === LOGIN with email ===
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
        setTimeout(() => window.location.href = "/indexMainpage.html", 1500);
      } catch (error) {
        msg.textContent = "❌ Login failed: " + error.message;
        console.error(error);
      }
    });
  }

  // === Google login/signup ===
  document.querySelectorAll('.google-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = "/indexMainpage.html";
      } catch (error) {
        alert("❌ Google sign in failed: " + error.message);
        console.error(error);
      }
    });
  });

  // === Phone login/signup ===
  document.querySelectorAll('.phone-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      const phoneNumber = prompt("Enter phone number with country code (e.g. +91XXXXXXXXXX):");
      if (!phoneNumber) return;

      try {
        // recaptchaVerifier already initialized once at DOMContentLoaded
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        const code = prompt("Enter the verification code you received:");
        if (!code) return;
        await confirmationResult.confirm(code);
        window.location.href = "/indexMainpage.html";
      } catch (error) {
        alert("❌ Phone sign in failed: " + error.message);
        console.error(error);
      }
    });
  });

  // === Nav login/logout toggle ===
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
