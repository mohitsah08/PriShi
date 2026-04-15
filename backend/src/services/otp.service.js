import { randomInt } from 'node:crypto';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

import { sendOtpEmail } from './email.service.js';

function buildExpiry() {
  return new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000);
}

export function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

export function clearOtp(user) {
  user.otp = null;
  user.otpExpiry = null;
  user.otpPurpose = null;
  user.otpLastSentAt = null;
}

export async function issueOtp(user, purpose) {
  const otp = generateOtpCode();
  user.otp = otp;
  user.otpExpiry = buildExpiry();
  user.otpPurpose = purpose;
  user.otpLastSentAt = new Date();
  await user.save();

  return otp;
}

export async function sendOtpChallenge(user, purpose) {
  const otp = await issueOtp(user, purpose);
  const delivery = user.email
    ? { channel: 'email', value: user.email }
    : user.phone
      ? { channel: 'phone', value: user.phone }
      : null;

  if (!delivery) {
    throw new ApiError(400, 'A verified email or phone is required for OTP delivery');
  }

  if (delivery.channel === 'email') {
    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      purpose
    });
  } else if (env.nodeEnv === 'production') {
    throw new ApiError(503, 'Phone OTP delivery is not configured');
  } else {
    console.log('[otp.service] Phone OTP fallback (development only):', {
      phone: user.phone,
      purpose,
      otp
    });
  }

  return {
    delivery,
    expiresAt: user.otpExpiry,
    devOtp:
      env.nodeEnv === 'production' || delivery.channel === 'email'
        ? undefined
        : otp
  };
}

export function verifyOtpOrThrow(user, otp, purpose) {
  if (!user.otp || !user.otpExpiry || !user.otpPurpose) {
    throw new ApiError(400, 'OTP has not been requested');
  }

  if (user.otpPurpose !== purpose) {
    throw new ApiError(400, 'OTP purpose does not match');
  }

  if (user.otpExpiry.getTime() < Date.now()) {
    throw new ApiError(400, 'OTP has expired');
  }

  if (String(user.otp) !== String(otp || '').trim()) {
    throw new ApiError(400, 'Invalid OTP');
  }
}
