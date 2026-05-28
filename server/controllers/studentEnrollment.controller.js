import {
  createStudentEnrollment,
  getStudentEnrollmentByUserId,
} from "../services/studentEnrollment.service.js";

export const createEnrollmentController = async (req, res) => {
  try {
    const enrollment = await createStudentEnrollment(req.body);

    return res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Create Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
    });
  }
};

export const getEnrollmentByUserController = async (req, res) => {
  try {
    const { user_id } = req.params;

    const enrollment = await getStudentEnrollmentByUserId(user_id);

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Get Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
    });
  }
};
