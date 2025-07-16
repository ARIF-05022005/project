const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// POST /api/user/location
router.post('/location', authMiddleware, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.location = location;
    await user.save();

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;