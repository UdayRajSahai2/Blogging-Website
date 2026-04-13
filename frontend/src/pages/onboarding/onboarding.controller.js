//frontend\src\pages\onboarding\onboarding.controller.js
export const getCurrentStepFromData = (steps, userData) => {
  //  HANDLE UNKNOWN USER TYPE FIRST

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    let isValid = false;

    if (step.id === "profile") {
      isValid = step.validate(userData);
    }

    if (step.id === "academic") {
      isValid = step.validate(userData.academics);
    }

    if (step.id === "professional") {
      isValid = step.validate(userData.professional, userData.skipProfessional);
    }

    if (!isValid) {
      return i;
    }
  }

  return null;
};
export const getNextStep = (currentStep, steps, userData) => {
  const currentStepId = steps[currentStep]?.id;

  // AFTER ACADEMIC → ASK QUESTION (ONLY IF NOT ANSWERED)
  if (currentStepId === "academic" && !userData?.occupation_status) {
    return "ask-employment";
  }

  if (currentStep < steps.length - 1) {
    return currentStep + 1;
  }

  return null;
};

export const isLastStep = (step, steps) => {
  return step === steps.length - 1;
};
// NEW HELPERS
export const getStepIndexFromId = (stepId, steps) => {
  return steps.findIndex((step) => step.id === stepId);
};

export const getStepIdFromIndex = (index, steps) => {
  return steps[index]?.id || null;
};
