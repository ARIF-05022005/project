const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already
if (!admin.apps.length) {
  const serviceAccount = require('../config/firebaseServiceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Token Error:', error);
    return res.status(401).json({ message: 'Invalid Firebase token' });
  }
};

module.exports = authMiddleware;