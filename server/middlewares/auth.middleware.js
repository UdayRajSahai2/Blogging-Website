// server/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No access token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);

    // req.user is a NUMBER (user_id)
    req.user = decoded.user_id;

    next();
  } catch (err) {
    return res.status(403).json({ error: "Access token is invalid" });
  }
};
