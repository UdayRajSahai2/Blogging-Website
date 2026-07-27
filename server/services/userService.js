//server\services\userService.js
import Enrollment from "../models/user/Enrollment.js";

//Enrollment service
export const createEnrollment = async (payload) => {
  return await Enrollment.create(payload);
};

export const getEnrollmentByUserId = async (user_id) => {
  return await Enrollment.findOne({
    where: { user_id },
  });
};
