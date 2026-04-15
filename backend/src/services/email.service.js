import { createRequire } from 'node:module';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const require = createRequire(import.meta.url);
let nodemailer = null;

try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

let transporter;

function assertEmailEnvironment() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new ApiError(503, 'Email OTP delivery is not configured');
  }
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!nodemailer) {
    throw new ApiError(503, 'Email OTP delivery is temporarily unavailable');
  }

  if (env.smtp.host) {
    assertEmailEnvironment();

    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    return transporter;
  }

  assertEmailEnvironment();

  transporter = nodemailer.createTransport({
    service: env.smtp.service,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
}

export async function sendOtpEmail({ to, name, otp, purpose }) {
  const transport = getTransporter();
  const subjectMap = {
    signup: 'Verify your PriShi account',
    'password-reset': 'Reset your PriShi password',
    'change-password': 'Confirm your PriShi password change'
  };

  const purposeLabel =
    purpose === 'signup'
      ? 'verify your account'
      : purpose === 'password-reset'
        ? 'reset your password'
        : 'change your password';

  console.log('[email.service] Sending OTP email', {
    to,
    otp,
    purpose
  });

  const info = await transport.sendMail({
    from: env.smtp.from,
    to,
    subject: subjectMap[purpose] || 'Your PriShi verification code',
    text: [
      `Hello ${name || 'there'},`,
      '',
      `Use this one-time code to ${purposeLabel}: ${otp}`,
      '',
      `This code expires in ${env.otp.expiryMinutes} minutes.`,
      '',
      'If you did not request this code, you can ignore this email.'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <p>Hello ${name || 'there'},</p>
        <p>Use this one-time code to ${purposeLabel}:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 0.35em;">${otp}</p>
        <p>This code expires in ${env.otp.expiryMinutes} minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `
  });

  console.log('[email.service] sendMail response', {
    messageId: info?.messageId || null,
    response: info?.response || null
  });

  return info;
}
