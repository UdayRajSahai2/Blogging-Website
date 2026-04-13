import jwt from "jsonwebtoken";
export const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No access token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);

    //  Core identity
    req.userId = decoded.user_id;

    //  Authority
    req.systemRole = decoded.system_role?.toLowerCase();

    //  Business roles
    req.userRoles = (decoded.roles || []).map((r) => r.toLowerCase());

    //  Active role (optional)
    req.primaryRole = decoded.primary_role;

    //  future security
    req.roleVersion = decoded.role_version;

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);

    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};
