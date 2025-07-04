# 📦 Healthcare Project – Backend

This is the backend part of the **Healthcare Web Application**, built with **Node.js**, **Express**, and **MongoDB**.  
It handles user authentication, database operations, and serves as the main API for the frontend.

---

## 🚀 Features
✅ User Registration (Signup)  
✅ User Login (with JWT authentication)  
✅ Secure password hashing with bcrypt  
✅ MongoDB integration with Mongoose  
✅ CORS enabled for frontend connection  
✅ Structured with MVC pattern

---

## 🛠 Tech Stack
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcryptjs
- jsonwebtoken (JWT)
- dotenv

---

## 📂 Project Structure
```bash
backend/
├── config/
│   └── db.js            # MongoDB connection setup
├── controllers/
│   └── authController.js # Logic for login & register
├── models/
│   └── User.js          # Mongoose User model
├── routes/
│   └── auth.js          # Auth routes
├── .env                 # Environment variables (not committed)
├── package.json
└── server.js            # Entry point
# project
