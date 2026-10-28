import { sendEmail, isEmailConfigured } from '../config/nodemailer.js';

export const sendWelcomeEmail = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: 'Welcome to Lost & Found — Connecting People with Belongings',
    html: `
      <div style="font-family: sans-serif; color: #1b4332; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2d6a4f;">Welcome to Lost & Found, ${user.name}!</h2>
        <p>Your account has been successfully created. Every lost item deserves a way home, and our community is here to help.</p>
        <p>You can now report lost or found items, search listings, submit claims, and communicate safely.</p>
        <div style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          If you didn't create this account, please ignore this email.
        </div>
      </div>
    `,
    text: `Welcome to Lost & Found, ${user.name}! Your account is ready. Report lost or found items at our portal.`,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  return await sendEmail({
    to: user.email,
    subject: 'Lost & Found — Password Reset Request',
    html: `
      <div style="font-family: sans-serif; color: #1b4332; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2d6a4f;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Please click the button below to set a new password. This link is valid for 1 hour.</p>
        <p style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #2d6a4f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="word-break: break-all; font-size: 12px; color: #4b5563;">
          Or copy and paste this link: ${resetUrl}
        </p>
        <div style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          If you did not make this request, your account is safe and you can safely ignore this email.
        </div>
      </div>
    `,
    text: `Hello ${user.name},\n\nYou requested a password reset. Use this link: ${resetUrl} (valid for 1 hour).`,
  });
};

export const sendNotificationEmail = async (user, title, message) => {
  return await sendEmail({
    to: user.email,
    subject: `Lost & Found Notification: ${title}`,
    html: `
      <div style="font-family: sans-serif; color: #1b4332; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h3 style="color: #2d6a4f;">${title}</h3>
        <p>${message}</p>
        <p style="margin-top: 20px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color: #2d6a4f; text-decoration: underline;">
            Visit your Lost & Found Dashboard
          </a>
        </p>
      </div>
    `,
    text: `${title}\n\n${message}\n\nVisit: ${process.env.CLIENT_URL || 'http://localhost:5173'}`,
  });
};
