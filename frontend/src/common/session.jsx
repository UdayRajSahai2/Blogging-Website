// frontend/src/common/session.jsx
const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || user?.user_id || null;
};
/* =========================
   STORE DATA
========================= */
const storeInSession = (key, value) => {
  try {
    if (value === undefined || value === null) return;

    const data = typeof value === "string" ? value : JSON.stringify(value);

    sessionStorage.setItem(key, data);
  } catch (err) {
    console.error("SessionStorage set error:", err);
  }
};

/* =========================
   GET DATA
========================= */
const lookInSession = (key) => {
  try {
    const value = sessionStorage.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value; // fallback (plain string)
    }
  } catch (err) {
    console.error("SessionStorage get error:", err);
    return null;
  }
};

/* =========================
   REMOVE DATA
========================= */
const removeFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.error("SessionStorage remove error:", err);
  }
};

/* =========================
   CLEAR ALL (LOGOUT)
========================= */
const clearSession = () => {
  try {
    sessionStorage.clear();
  } catch (err) {
    console.error("SessionStorage clear error:", err);
  }
};

/* =========================
   USER HELPERS
========================= */

// Full user object
const getCurrentUser = () => {
  return lookInSession("user") || null;
};

// Access token
const getAccessToken = () => {
  const user = getCurrentUser();
  return user?.access_token || null;
};

// Roles (always returns array ✅)
const getUserRoles = () => {
  const user = getCurrentUser();
  const roles = user?.roles;

  return Array.isArray(roles) ? roles : [];
};

// Check role safely
const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

// Primary role
const getPrimaryRole = () => {
  const user = getCurrentUser();
  return user?.primary_role || null;
};

// Optional: check login state
const isAuthenticated = () => {
  return !!getAccessToken();
};

/* =========================
   EXPORTS
========================= */
export {
  getCurrentUserId,
  storeInSession,
  lookInSession,
  removeFromSession,
  clearSession,
  getCurrentUser,
  getAccessToken,
  getUserRoles,
  hasRole,
  getPrimaryRole,
  isAuthenticated,
};
