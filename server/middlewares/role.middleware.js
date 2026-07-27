//
// ================================
// ROLE MIDDLEWARE (PRODUCTION SAFE)
// ================================
// System Role  → admin access (platform security)
// Business Role → feature access (app functionality)
// ================================
//

/**
 * =========================
 * SYSTEM ROLE AUTHORIZATION
 * =========================
 * Used for platform/admin level routes
 */
export const authorizeSystemRoles = (...allowedSystemRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const systemRole = req.user.systemRole?.toLowerCase();

      // SUPER ADMIN BYPASS (full access)
      if (systemRole === "super_admin") {
        return next();
      }

      const allowed = allowedSystemRoles.map((r) => r.toLowerCase());

      if (systemRole && allowed.includes(systemRole)) {
        return next();
      }

      return res.status(403).json({
        message: "System role access denied",
        systemRole,
        requiredSystemRoles: allowed,
      });
    } catch (err) {
      console.error("SYSTEM ROLE ERROR:", err);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

/**
 * =========================
 * BUSINESS ROLE AUTHORIZATION
 * =========================
 * Used for feature-level access (student, teacher, etc.)
 */
export const authorizeBusinessRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles.map((r) => r.toLowerCase())
        : [];

      const allowed = allowedRoles.map((r) => r.toLowerCase());

      const hasAccess = userRoles.some((role) => allowed.includes(role));

      if (!hasAccess) {
        return res.status(403).json({
          message: "Business role access denied",
          userRoles,
          requiredRoles: allowed,
        });
      }

      next();
    } catch (err) {
      console.error("BUSINESS ROLE ERROR:", err);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

// //optional enterprise-level flexibility
// /**
//  * =========================
//  * COMBINED AUTHORIZATION
//  * =========================
//  * Advanced use: system OR business role access
//  */
// export const authorizeAny = ({ systemRoles = [], businessRoles = [] }) => {
//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const systemRole = req.user.systemRole?.toLowerCase();

//       const userRoles = Array.isArray(req.user.roles)
//         ? req.user.roles.map((r) => r.toLowerCase())
//         : [];

//       // SUPER ADMIN ALWAYS ALLOWED
//       if (systemRole === "super_admin") {
//         return next();
//       }

//       const systemAllowed = systemRoles.map((r) => r.toLowerCase());

//       const businessAllowed = businessRoles.map((r) => r.toLowerCase());

//       const systemOk = systemRole && systemAllowed.includes(systemRole);

//       const businessOk = userRoles.some((role) =>
//         businessAllowed.includes(role),
//       );

//       if (!systemOk && !businessOk) {
//         return res.status(403).json({
//           message: "Access denied",
//           systemRole,
//           userRoles,
//           requiredSystemRoles: systemAllowed,
//           requiredBusinessRoles: businessAllowed,
//         });
//       }

//       next();
//     } catch (err) {
//       console.error("AUTH ERROR:", err);

//       return res.status(500).json({
//         message: "Internal server error",
//       });
//     }
//   };
// };
