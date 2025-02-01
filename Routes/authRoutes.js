import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin credentials (move to database in production)
const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign(
      { id: 'admin', email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: 'admin',
        email
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

export default router; 