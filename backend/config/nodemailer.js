import nodemailer from 'nodemailer';

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('[Email] Nodemailer configured with SMTP credentials.');
} else {
  console.log('[Email] SMTP credentials not provided. Outgoing emails will be logged cleanly to console.');
}

export const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.SMTP_FROM || 'Lost & Found Support <noreply@lostandfound.local>';
  if (transporter) {
    return await transporter.sendMail({ from, to, subject, html, text });
  } else {
    console.log('----------------------------------------------------');
    console.log(`[EMAIL DISPATCH SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    console.log('----------------------------------------------------');
    return { messageId: 'simulated-dev-id-' + Date.now() };
  }
};

export const isEmailConfigured = () => isSmtpConfigured;
export default transporter;
