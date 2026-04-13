//frontend\src\pages\onboarding\onboarding.config.js
import EditProfile from "../profile/edit-profile.page";
import AcademicForm from "../../components/profile/academic/AcademicForm";
import ProfessionalProfile from "../profile/ProfessionalProfile";

//  VALIDATION FUNCTIONS
export const validateProfile = (data) => {
  return !!(data?.first_name && data?.last_name);
};

export const validateAcademic = (data) => {
  return Array.isArray(data) && data.length > 0;
};

export const validateProfessional = (experiences, skip) => {
  return (Array.isArray(experiences) && experiences.length > 0) || skip;
};

//  STEP CONFIG
export const onboardingSteps = [
  {
    id: "profile",
    label: "Personal Details",
    component: EditProfile,
    validate: validateProfile,
  },
  {
    id: "academic",
    label: "Education Details",
    component: AcademicForm,
    validate: validateAcademic,
  },

  {
    id: "professional",
    label: "Professional Details",
    component: ProfessionalProfile,
    validate: validateProfessional,
  },
];
