const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"EventSync" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset OTP - EventSync',
    html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#161121;color:#e9def6;padding:40px;border-radius:16px;">
      <h1 style="color:#c6bfff;">EventSync</h1>
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>Your OTP for password reset is:</p>
      <div style="background:#2d2739;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
        <span style="font-size:32px;font-weight:bold;color:#6C5CE7;letter-spacing:8px;">${otp}</span>
      </div>
      <p>This OTP is valid for 10 minutes.</p>
      <p style="color:#928ea0;font-size:12px;">If you didn't request this, please ignore this email.</p>
    </div>`,
  };
  return transporter.sendMail(mailOptions);
};

const sendBookingConfirmation = async (email, name, booking) => {
  const mailOptions = {
    from: `"EventSync" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Booking Confirmed! - EventSync',
    html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#161121;color:#e9def6;padding:40px;border-radius:16px;">
      <h1 style="color:#c6bfff;">EventSync</h1>
      <h2 style="color:#6C5CE7;">Booking Confirmed! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your booking has been confirmed.</p>
      <div style="background:#2d2739;padding:20px;border-radius:12px;margin:20px 0;">
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Total:</strong> $${booking.totalAmount}</p>
      </div>
      ${booking.qrCode ? `<div style="text-align:center;margin:20px 0;"><img src="${booking.qrCode}" alt="QR Code" style="width:200px;height:200px;"/></div>` : ''}
      <p style="color:#928ea0;font-size:12px;">Show this QR code at the event entrance.</p>
    </div>`,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendBookingConfirmation };
