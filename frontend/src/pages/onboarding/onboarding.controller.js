// frontend/src/pages/onboarding/onboarding.controller.js

// ===============================
// Returns first incomplete step
// ===============================
export const getInitialStepFromData = (steps, userData) => {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    let isValid = false;

    switch (step.id) {
      case "profile":
        isValid = step.validate(userData);
        break;

      case "academic":
        isValid = step.validate(userData?.academics);
        break;

      case "professional":
        isValid = step.validate(
          userData?.professional,
          userData?.skipProfessional,
        );
        break;

      default:
        isValid = true;
    }

    if (!isValid) {
      return i;
    }
  }

  return null;
};

// ===============================
// Next Step
// ===============================
export const getNextStep = (currentStep, steps) => {
  if (currentStep < steps.length - 1) {
    return currentStep + 1;
  }

  return null;
};

// ===============================
// Last Step
// ===============================
export const isLastStep = (step, steps) => {
  return step === steps.length - 1;
};

// ===============================
// Helpers
// ===============================
export const getStepIndexFromId = (stepId, steps) => {
  return steps.findIndex((step) => step.id === stepId);
};

export const getStepIdFromIndex = (index, steps) => {
  return steps[index]?.id || null;
};

// ===============================
// Should show professional?
// ===============================
export const shouldShowProfessional = (user) => {
  return (
    user?.employment_status === "employed" ||
    user?.employment_status === "self_employed" ||
    user?.employment_status === "retired"
  );
};
