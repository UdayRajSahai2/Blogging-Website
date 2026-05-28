import StudentEnrollment from "../models/student/StudentEnrollment.js";

export const createStudentEnrollment = async (payload) => {
  return await StudentEnrollment.create(payload);
};

export const getStudentEnrollmentByUserId = async (user_id) => {
  return await StudentEnrollment.findOne({
    where: { user_id },
  });
};
