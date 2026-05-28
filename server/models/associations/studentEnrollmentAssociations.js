import User from "../user/User.js";
import StudentEnrollment from "../student/StudentEnrollment.js";

const setupStudentEnrollmentAssociations = () => {
  // User -> Student Enrollment
  User.hasOne(StudentEnrollment, {
    foreignKey: "user_id",
    as: "studentEnrollment",
    onDelete: "CASCADE",
  });

  // Student Enrollment -> User
  StudentEnrollment.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });
};

export default setupStudentEnrollmentAssociations;
