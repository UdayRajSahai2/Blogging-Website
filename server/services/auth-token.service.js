//server\services\auth-token.service.js
import jwt from "jsonwebtoken";

// export const generateAuthResponse = (user) => {
//   const access_token = jwt.sign(
//     {
//       user_id: user.user_id,
//       role: user.system_role, // FIXED
//     },
//     process.env.SECRET_ACCESS_KEY,
//     { expiresIn: "7d" },
//   );

//   return {
//     access_token,
//     profile_img: user.profile_img,
//     username: user.username,
//     fullname: user.fullname,
//     user_id: user.user_id,

//     role: user.system_role, // FIXED (frontend still gets "role")

//     customer_id: user.customer_id,
//     abbr: user.abbr,
//   };
// };

export const generateAuthResponse = (user) => {
  // 👤 Normalize roles
  const roles = user.Roles?.map((r) => r.role_name.toLowerCase()) || [];

  // 🎯 Primary role
  const primaryRoleObj = user.Roles?.find((r) => r.UserRole?.is_primary);

  const primary_role =
    primaryRoleObj?.role_name?.toLowerCase() || roles[0] || "student";

  const payload = {
    user_id: user.user_id,

    // 👤 Identity
    roles,
    primary_role,

    // 🔐 Authority
    system_role: user.system_role?.toLowerCase(),

    // 🔥 versioning (future-proof)
    role_version: user.role_version || 1,
  };

  const access_token = jwt.sign(payload, process.env.SECRET_ACCESS_KEY, {
    expiresIn: "7d",
  });

  return {
    access_token,

    user_id: user.user_id,
    username: user.username,
    fullname: user.fullname,
    profile_img: user.profile_img,

    system_role: user.system_role,
    roles,
    primary_role,

    role: user.system_role, // backward compatibility

    isOnboardingCompleted: user.is_onboarding_completed,
    customer_id: user.customer_id,
    abbr: user.abbr,
  };
};
