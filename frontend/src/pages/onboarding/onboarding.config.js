// frontend/src/pages/onboarding/onboarding.config.js

import EditProfile from "../profile/edit-profile.page";
import AcademicForm from "../../components/profile/academic/AcademicForm";
import ProfessionalProfile from "../profile/ProfessionalProfile";

// ==========================
// VALIDATION FUNCTIONS
// ==========================

export const validateProfile = (user) => {
  return !!(user?.first_name && user?.last_name);
};

export const validateAcademic = (academics) => {
  return Array.isArray(academics) && academics.length > 0;
};

export const validateProfessional = (professional, skipProfessional) => {
  return (
    (Array.isArray(professional) && professional.length > 0) ||
    skipProfessional === true
  );
};

// ==========================
// ONBOARDING STEPS
// IMPORTANT:
// Order matters!
// ==========================

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
