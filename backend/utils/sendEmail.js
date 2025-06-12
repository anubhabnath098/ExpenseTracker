import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

export async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Expense Tracker" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: 'Your OTP for registration',
    html: `<p>Your OTP for registration is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
