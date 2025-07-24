// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Create or update Firebase user in MongoDB
 */
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const email = req.body.email || req.user.email || '';
    const username = req.body.username || req.user.displayName || email || firebaseUid;
    const password = req.body.password || '';

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({ firebaseUid, email, username, password });
      await user.save();
      console.log(`✅ New user saved for UID: ${firebaseUid}`);
    } else {
      console.log(`✅ User already exists for UID: ${firebaseUid}`);
    }

    res.json({ message: 'User synced to DB', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;