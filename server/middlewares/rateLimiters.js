import rateLimit from "express-rate-limit";

export const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many OTP requests. Try again later." },
});

export const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "Too many OTP attempts. Try again later." },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "Too many reset attempts. Try again later." },
});
