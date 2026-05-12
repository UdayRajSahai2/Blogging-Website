import apiClient from "../services/apiClient";

/* Auth API */

export const signIn = (data) => apiClient.post("/api/auth/signin", data);

export const signUp = (data) => apiClient.post("/api/auth/signup", data);

export const googleAuth = (data) =>
  apiClient.post("/api/auth/google-auth", data);

export const verifyEmailOtp = (data) =>
  apiClient.post("/api/auth/verify-email-otp", data);

export const completeSignup = (data) =>
  apiClient.post("/api/auth/complete-signup", data);

export const changePassword = (data) =>
  apiClient.post("/api/auth/change-password", data);

export const forgotPassword = (data) =>
  apiClient.post("/api/auth/forgot-password", data);

export const verifyPasswordOtp = (data) =>
  apiClient.post("/api/auth/verify-password-email-otp", data);

export const validatePasswordResetToken = (data) =>
  apiClient.post("/api/auth/validate-password-reset-token", data);

export const resetPassword = (data) =>
  apiClient.post("/api/auth/reset-password", data);

export const completeOnboarding = () =>
  apiClient.post("/api/auth/complete-onboarding");

export const logoutUser = () => apiClient.post("/api/auth/logout");
