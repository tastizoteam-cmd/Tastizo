import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger } from './logger.js';

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    const { emailHost, emailPort, emailUser, emailPass } = config;
    if (!emailHost || !emailUser || !emailPass) {
        logger.warn('Email not configured: EMAIL_HOST, EMAIL_USER, EMAIL_PASS required');
        return null;
    }
    transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort || 587,
        secure: emailPort === 465,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
    return transporter;
}

/**
 * Send OTP email for admin forgot password.
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>} true if sent, false if skipped/failed
 */
export async function sendAdminResetOtpEmail(to, otp) {
    const trans = getTransporter();
    if (!trans) {
        logger.warn('Admin OTP email skipped: SMTP not configured');
        return false;
    }
    const from = config.emailFrom || config.emailUser;
    const subject = 'Your password reset code – Tastizo Admin';
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 480px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/dciu4uawr/image/upload/v1786958933/tastizo-email-logo.png" alt="Tastizo" style="max-height: 110px; font-size: 24px; font-weight: bold; color: #2b9d58;" />
  </div>
  <h2 style="color: #111;">Password reset code</h2>
  <p>Use the code below to reset your admin password. It is valid for 10 minutes.</p>
  <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; background: #f5f5f5; padding: 12px 16px; border-radius: 8px;">${otp}</p>
  <p style="color: #666; font-size: 14px;">If you did not request this, you can ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">Tastizo Admin</p>
</body>
</html>`;
    const text = `Your password reset code is: ${otp}. It is valid for 10 minutes. If you did not request this, ignore this email.`;

    try {
        await trans.sendMail({
            from: typeof from === 'string' && from.includes('<') ? from : `Tastizo <${from}>`,
            to,
            subject,
            text,
            html
        });
        logger.info(`Admin reset OTP email sent to ${to}`);
        return true;
    } catch (err) {
        logger.error(`Failed to send admin OTP email to ${to}:`, err.message);
        return false;
    }
}

/**
 * Send Approval email for restaurant / delivery boy.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} role - Role string ("Restaurant" or "Delivery Partner")
 * @returns {Promise<boolean>}
 */
export async function sendApprovalEmail(to, name, role) {
    const trans = getTransporter();
    if (!trans) {
        logger.warn('Approval email skipped: SMTP not configured');
        return false;
    }
    const from = config.emailFrom || config.emailUser;
    const subject = `Your ${role} account has been approved – Tastizo`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 30px; font-size: 18px;">
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 12px; border: 1px solid #eaeaea;">
      <div style="text-align: center; margin-bottom: 25px;">
          <img src="https://res.cloudinary.com/dciu4uawr/image/upload/v1786958933/tastizo-email-logo.png" alt="Tastizo" style="max-height: 145px; font-size: 32px; font-weight: bold; color: #2b9d58;" />
      </div>
      <h1 style="color: #2b2b2b; font-size: 28px; text-align: center; margin-bottom: 20px;">Congratulations! 🎉</h1>
      <p style="font-size: 20px;">Hello <strong>${name}</strong>,</p>
      <p>We are thrilled to inform you that your application to join Tastizo as a <strong style="color: #ff5722;">${role}</strong> has been <strong>successfully approved</strong>.</p>
      
      <div style="background-color: #ffffff; padding: 20px; border-left: 5px solid #4CAF50; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #4CAF50; font-size: 22px;">What's Next?</h3>
          <ul style="margin-bottom: 0; padding-left: 20px; font-size: 18px;">
              <li style="margin-bottom: 12px;">Log in to your Tastizo app or dashboard using your registered credentials.</li>
              <li style="margin-bottom: 12px;">Complete your profile setup and ensure your banking and contact details are accurate.</li>
              <li>Toggle your status to <strong>Online</strong> so you can start working and earning immediately!</li>
          </ul>
      </div>
      
      <p style="font-size: 18px;">If you need any help getting started, our support team is available 24/7. Please don't hesitate to reach out via the Help section in your app.</p>
      <br/>
      <p style="font-size: 22px; font-weight: bold; color: #ff5722;">Welcome to the Tastizo family!</p>
  </div>
  <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">© ${new Date().getFullYear()} Tastizo. All rights reserved.</p>
</body>
</html>`;
    const text = `Hello ${name}, your application to join Tastizo as a ${role} has been successfully approved. You can now log in to your dashboard. Welcome to the Tastizo family!`;

    try {
        await trans.sendMail({
            from: typeof from === 'string' && from.includes('<') ? from : `Tastizo <${from}>`,
            to,
            subject,
            text,
            html
        });
        logger.info(`Approval email sent to ${to}`);
        return true;
    } catch (err) {
        logger.error(`Failed to send approval email to ${to}:`, err.message);
        return false;
    }
}

