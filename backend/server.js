const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'CONTACT_TO_EMAIL'
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
const isMailConfigured = missingEnvVars.length === 0;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    }
  })
);

app.use(express.json({ limit: '1mb' }));

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitize = (value) => String(value || '').trim();

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    mailConfigured: isMailConfigured,
    missingEnvVars
  });
});

app.post('/api/contact', async (req, res) => {
  const name = sanitize(req.body?.name);
  const email = sanitize(req.body?.email);
  const subject = sanitize(req.body?.subject);
  const message = sanitize(req.body?.message);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, message: 'All fields are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Please provide a valid email address.' });
  }

  if (!isMailConfigured || !transporter) {
    return res.status(500).json({
      ok: false,
      message: `Email service is not configured. Missing env vars: ${missingEnvVars.join(', ')}`
    });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;
  const replyTo = email;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${fromEmail}>`,
      to: toEmail,
      replyTo,
      subject: `Portfolio Contact: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message
      ].join('\n'),
      html: `
        <h2>New Portfolio Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `
    });

    return res.status(200).json({ ok: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Failed to send contact email:', error);

    const smtpAuthFailed =
      error?.code === 'EAUTH' ||
      /auth|authentication|username and password not accepted/i.test(String(error?.message || ''));

    const responseMessage = smtpAuthFailed
      ? 'SMTP authentication failed. For Gmail, use a Google App Password instead of your normal Gmail password.'
      : error?.message || 'Failed to send message. Please try again later.';

    return res.status(500).json({ ok: false, message: responseMessage });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: err.message || 'Unexpected server error.' });
});

app.listen(port, async () => {
  console.log(`Contact server listening on port ${port}`);

  if (!isMailConfigured) {
    console.warn(`Email is not configured. Missing env vars: ${missingEnvVars.join(', ')}`);
    return;
  }

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully.');
  } catch (error) {
    console.error('SMTP verification failed:', error.message);
  }
});

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
