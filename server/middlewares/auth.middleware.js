import jwt from "jsonwebtoken";

/**
 *  Shared: Attach user to request
 * Single source of truth for user structure
 */
const attachUser = (req, decoded) => {
  req.user = {
    id: decoded.user_id,
    systemRole: decoded.system_role?.toLowerCase() || null,
    roles: Array.isArray(decoded.roles)
      ? decoded.roles.map((r) => r.toLowerCase())
      : [],
    primaryRole: decoded.primary_role || null,
    roleVersion: decoded.role_version || null,
  };
};

/**
 *  STRICT AUTH
 * Blocks request if token is missing/invalid
 * Use for protected routes
 */
export const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //  No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No access token" });
    }

    const token = authHeader.split(" ")[1];

    //  Invalid token
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);

    if (!decoded?.user_id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    //  Attach user
    attachUser(req, decoded);

    next();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT ERROR:", err.message);
    }

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/**
 *  OPTIONAL AUTH
 * Does NOT block request
 * Attaches user if token exists
 * Use for public routes with personalization
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //  No token → guest user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);

    if (!decoded?.user_id) {
      return next();
    }

    //  Attach user (same structure as verifyJWT)
    attachUser(req, decoded);

    next();
  } catch (err) {
    //  Never block request
    if (process.env.NODE_ENV === "development") {
      console.warn("Optional auth failed:", err.message);
    }
    next();
  }
};
