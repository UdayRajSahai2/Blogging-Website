export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  let ip =
    forwarded?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;

  if (ip?.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  return ip;
};
