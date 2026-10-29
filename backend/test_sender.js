import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zeptomail.in',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'emailapikey',
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

async function testFrom() {
  try {
    const res = await transporter.sendMail({
      from: '"Abhishek Gour | Leovexa" <abhishek@leovexa.in>',
      to: 'abhishek@leovexa.in',
      subject: 'Testing Outbound from abhishek@leovexa.in',
      text: 'This email is sent directly from abhishek@leovexa.in via ZeptoMail SMTP.'
    });
    console.log('✅ Success sending from abhishek@leovexa.in:', res.messageId);
  } catch(e) {
    console.error('❌ Error sending from abhishek@leovexa.in:', e.message);
  }
}

testFrom();
