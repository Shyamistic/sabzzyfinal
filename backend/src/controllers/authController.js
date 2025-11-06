import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';
import { generateOTP, saveOTP, verifyOTP, sendOTPSMS } from '../utils/otp.js';

const prisma = new PrismaClient();

export const sendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required',
      });
    }

    const otp = generateOTP();
    await saveOTP(phoneNumber, otp);
    await sendOTPSMS(phoneNumber, otp);

    res.json({
      status: 'success',
      message: 'OTP sent successfully',
      // In development, include OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTPAndLogin = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number and OTP are required',
      });
    }

    const isValid = await verifyOTP(phoneNumber, otp);

    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP',
      });
    }

    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        vendorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please register first.',
        needsRegistration: true,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    const token = generateToken(user.id);

    const { password, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { phoneNumber, password, name, email } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number and password are required',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        name,
        email,
      },
    });

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        vendorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vendorProfile: true,
        addresses: true,
      },
    });

    const { password, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
