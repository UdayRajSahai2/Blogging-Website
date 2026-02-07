import nodemailer from 'nodemailer';

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendEmailOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  });
}

export async function sendSMSOTP(mobile, otp) {
  // For now, just log the OTP for mobile
  console.log(`(DEV MODE) OTP for ${mobile}: ${otp}`);
}
