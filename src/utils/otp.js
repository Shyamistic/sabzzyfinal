import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = async (phoneNumber, otp) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.oTP.create({
    data: {
      phoneNumber,
      otp,
      expiresAt,
    },
  });

  return otp;
};

export const verifyOTP = async (phoneNumber, otp) => {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      phoneNumber,
      otp,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return false;
  }

  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return true;
};

export const sendOTPSMS = async (phoneNumber, otp) => {
  // In production, integrate with SMS service like Twilio, MSG91, etc.
  console.log(`📱 Sending OTP ${otp} to ${phoneNumber}`);
  
  // For development, just log it
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ OTP for ${phoneNumber}: ${otp}`);
  }
  
  return true;
};
