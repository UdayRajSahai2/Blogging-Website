import nodemailer from "nodemailer";

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendEmailOTP(email, otp) {
  try {
    // Debug (safe)
    console.log("EMAIL CONFIG CHECK:", {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? "✔ SET" : "❌ MISSING",
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true only for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Fail fast if auth is wrong
    await transporter.verify();

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });
  } catch (err) {
    console.error("❌ EMAIL SEND ERROR:", err);
    throw err;
  }
}

export async function sendSMSOTP(mobile, otp) {
  console.log(`(DEV MODE) OTP for ${mobile}: ${otp}`);
}
