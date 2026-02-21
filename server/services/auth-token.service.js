import jwt from "jsonwebtoken";

export const generateAuthResponse = (user) => {
  const access_token = jwt.sign(
    { user_id: user.user_id },
    process.env.SECRET_ACCESS_KEY,
  );

  return {
    access_token,
    profile_img: user.profile_img,
    username: user.username,
    fullname: user.fullname,
    user_id: user.user_id,
    customer_id: user.customer_id,
    abbr: user.abbr,
  };
};
