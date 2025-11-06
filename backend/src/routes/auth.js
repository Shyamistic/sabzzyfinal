import express from 'express';
import {
  sendOTP,
  verifyOTPAndLogin,
  register,
  login,
  getProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndLogin);
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
