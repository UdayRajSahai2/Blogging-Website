// server/middlewares/role.middleware.js

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      //  Ensure user exists
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const systemRole = req.user.systemRole;
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];

      const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

      //  SUPER ADMIN (full bypass)
      if (systemRole === "super_admin") {
        return next();
      }

      // SYSTEM ROLE CHECK
      if (systemRole && normalizedAllowed.includes(systemRole)) {
        return next();
      }

      //  BUSINESS ROLE CHECK
      const hasAccess = userRoles.some((role) =>
        normalizedAllowed.includes(role),
      );

      if (!hasAccess) {
        return res.status(403).json({
          message: "Access denied",
          systemRole,
          userRoles,
          requiredRoles: normalizedAllowed,
        });
      }

      next();
    } catch (err) {
      console.error("ROLE ERROR:", err);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};
