// src/common/api.js
const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

export const AUTH_API = `${BASE_URL}/api/auth`;
export const BLOG_API = `${BASE_URL}/api/blog`;
export const USER_API = `${BASE_URL}/api/user`;
export const UPLOAD_API = `${BASE_URL}/api/upload`;
export const NOTIFICATION_API = `${BASE_URL}/api/notification`;
export const COMMENT_API = `${BASE_URL}/api/comment`;
export const PROFESSIONS_API = `${BASE_URL}/api/professions`;
export const DONATION_API = `${BASE_URL}/api/donation`;
export const DONOR_API = `${BASE_URL}/api/donor`;
export const PAYMENT_API = `${BASE_URL}/api/payment`;
export const EXPENDITURE_API = `${BASE_URL}/api/expenditure`;
export const FINANCE_API = `${BASE_URL}/api/finance`;
