// src/common/api.js

const RAW_BASE_URL = import.meta.env.VITE_SERVER_DOMAIN || "";

// fallback to same domain in production
const BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.replace(/\/$/, "") : "";

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

export const ADMIN_EXPENDITURE_API = `${BASE_URL}/api/expenditure`;
export const ADMIN_FINANCE_API = `${BASE_URL}/api/finance`;
export const ADMIN_API = `${BASE_URL}/api/admin`;
export const ADMIN_COMMENTS_API = `${ADMIN_API}/comments`;

export const USER_DETAILS_API = `${BASE_URL}/api/user-details`;
export const LOCATION_API = `${BASE_URL}/api/location`;
export const PROFESSIONAL_PROFILE_API = `${BASE_URL}/api/professional-profile`;

export const INTEREST_API = `${BASE_URL}/api/interests`;

export const PROFILE_API = `${BASE_URL}/api/profile`;
export const ROLE_API = `${BASE_URL}/api/roles`;
