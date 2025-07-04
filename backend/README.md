# 📦 Healthcare Project – Backend

This is the backend part of the **Healthcare Web Application**, built with **JavaScript** and integrated with **Firebase Authentication**.  
It handles user authentication, manages login & signup (email, Google, phone), and serves as the secure gateway for user access.

---

## 🚀 Features
✅ Email/Password signup & login  
✅ Google Sign-In integration  
✅ Phone number authentication with reCAPTCHA  
✅ Modular code structure for clarity and maintenance  
✅ Supports user session handling and sign out  
✅ Ready for adding APIs or connecting to databases

---

## 🛠 Tech Stack
- JavaScript (ES modules)
- Firebase Authentication
- reCAPTCHA v2 (Invisible)
- HTML / CSS (frontend integration)

---

## 📂 Project Structure
```bash
project/
├── backend/
│   ├── config/                  # (Optional) Additional config or db.js
│   ├── controllers/            # authController.js and related logic
│   ├── models/                 # (Optional) Data models if extended
│   ├── routes/                 # (Optional) REST API routes
│   └── server.js               # Entry point / server logic
├── frontend/
│   ├── login.html              # Login page
│   ├── signup.html             # Signup page
│   └── js/
│       └── auth.js             # Handles all authentication logic
├── .env                        # Environment variables (Firebase config)
├── package.json
└── README.md                   # Project description
