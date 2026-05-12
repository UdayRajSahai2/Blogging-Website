import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { completeOnboarding } from "../../api/auth.api";
import toast from "react-hot-toast";
import { storeInSession } from "../../common/session";
import { CheckCircleIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { onboardingSteps } from "../onboarding/onboarding.config";
import {
  getNextStep,
  getCurrentStepFromData,
} from "../onboarding/onboarding.controller";

import { getUserTypeFromOccupation } from "../../common/userType.utils";

export default function OnboardingPage() {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const firstName = userAuth?.fullname?.split(" ")[0] || "there";
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showEmploymentQuestion, setShowEmploymentQuestion] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ONLY FIRST 3 STEPS
  const steps = onboardingSteps.slice(0, 3);
  const visibleSteps =
    userAuth?.user_type === "student"
      ? steps.slice(0, 2) // profile + academic
      : userAuth?.user_type === "retired"
        ? steps.slice(0, 1) // only profile
        : steps; // professional → all
  //  SAFE COMPONENT
  const CurrentComponent =
    visibleSteps[stepIndex]?.component || visibleSteps[0].component;

  useEffect(() => {
    if (!userAuth) return;

    const stepFromUrl = searchParams.get("step");

    // 👉 If URL has step
    if (stepFromUrl) {
      const index = visibleSteps.findIndex((s) => s.id === stepFromUrl);

      if (index !== -1) {
        setStepIndex(index);
        return;
      }
    }

    // 👉 fallback (auto detect)
    const step = getCurrentStepFromData(visibleSteps, userAuth);

    if (step === null) {
      navigate("/");
    } else {
      setStepIndex(step);
      setSearchParams({ step: visibleSteps[step].id }); // 🔥 sync URL
    }
  }, [userAuth]);
  useEffect(() => {
    const stepId = visibleSteps[stepIndex]?.id;

    if (stepId) {
      setSearchParams({ step: stepId });
    }
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex >= visibleSteps.length) {
      setStepIndex(visibleSteps.length - 1);
    }
  }, [userAuth?.user_type, visibleSteps.length]);

  /* SHOW MESSAGE FROM GUARD */
  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!userAuth) return;

    const step = getCurrentStepFromData(visibleSteps, userAuth);
    if (step !== null) setStepIndex(step);
  }, [userAuth?.user_type]);

  /* NEXT STEP */
  const handleNext = () => {
    const next = getNextStep(stepIndex, visibleSteps, userAuth);

    if (next === "ask-employment") {
      setShowEmploymentQuestion(true);
      return;
    }

    if (next !== null) {
      setStepIndex(next);
      setSearchParams({ step: visibleSteps[next].id }); //  important
    } else {
      handleFinish();
    }
  };

  /* FINISH */
  const handleFinish = async () => {
    try {
      await completeOnboarding();

      setCompleted(true);

      setUserAuth((prev) => ({
        ...prev,
        isOnboardingCompleted: true,
      }));

      // start countdown
      let time = 3;
      setCountdown(time);

      const interval = setInterval(() => {
        time -= 1;
        setCountdown(time);

        if (time === 0) {
          clearInterval(interval);
          navigate(`/user/${userAuth.username}`, { replace: true });
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const totalSteps =
    userAuth?.user_type === "student"
      ? 2
      : userAuth?.user_type === "retired"
        ? 1
        : steps.length;
  if (showEmploymentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* HEADER (same system as onboarding) */}
        <div className="w-full border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3 text-sm font-medium text-gray-700">
            Employment Details
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex items-center justify-center px-4 mt-6">
          <div className="w-full max-w-md">
            {/* CARD */}
            <div className="bg-white border rounded-xl p-6 shadow-sm transition-all">
              {/* STEP INDICATOR */}
              <p className="text-xs text-gray-400 mb-2">Step 3 of 3</p>

              {/* TITLE */}
              <h3 className="text-xl font-semibold text-gray-900">
                Are you currently working?
              </h3>

              {/* SUBTEXT */}
              <p className="text-sm text-gray-500 mt-1">
                We’ll tailor your profile based on this.
              </p>

              {/* OPTIONS */}
              <div className="mt-6 space-y-3">
                {/* YES */}
                <button
                  onClick={() => {
                    const occupation_status = "working";
                    const user_type =
                      getUserTypeFromOccupation(occupation_status);

                    const updated = {
                      ...userAuth,
                      occupation_status,
                      user_type,
                    };

                    setUserAuth(updated);
                    storeInSession("user", updated);
                    setShowEmploymentQuestion(false);
                  }}
                  className="w-full px-4 py-3 border rounded-lg flex items-center justify-between 
          hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Yes, I’m working
                  </span>

                  <span className="text-gray-400 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </button>

                {/* NO */}
                <button
                  onClick={() => {
                    const occupation_status = "not_working";
                    const user_type =
                      getUserTypeFromOccupation(occupation_status);

                    const updated = {
                      ...userAuth,
                      occupation_status,
                      user_type,
                    };

                    setUserAuth(updated);
                    storeInSession("user", updated);

                    setShowEmploymentQuestion(false);
                    handleFinish();
                  }}
                  className="w-full px-4 py-3 border rounded-lg flex items-center justify-between 
          hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Not working
                  </span>

                  <span className="text-gray-400 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {completed ? (
        <div className="min-h-screen flex items-start justify-center pt-10 bg-white">
          <div className="text-center p-8 max-w-md w-full">
            {/* ICON */}
            <div className="flex justify-center mb-5">
              <div className="bg-green-50 p-4 rounded-full">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
            </div>
            {/* HEADING */}

            <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
              Hi {firstName}, you're all set
            </h3>
            {/* TEXT */}
            <p className="text-gray-800 mt-3 text-base leading-relaxed">
              Your profile has been completed successfully. You’ll be redirected
              to your profile shortly.
            </p>

            {/* ✅ ADD HERE */}
            <p className="text-gray-500 mt-4 text-sm">
              Redirecting in {countdown}...
            </p>

            <button
              onClick={() =>
                navigate(`/user/${userAuth.username}`, { replace: true })
              }
              className="mt-5 px-4 py-2 bg-black text-white rounded-lg text-sm"
            >
              Go to profile now
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="w-full bg-yellow-50 border-yellow-200 mb-1">
            <div className="max-w-5xl mx-auto flex items-center justify-between text-sm">
              <div className="text-yellow-800 font-medium">
                📝 Complete your profile to get started
              </div>

              <div className="text-yellow-700 font-medium">
                {visibleSteps[stepIndex].label}
                <span className="ml-2 text-xs text-yellow-600">
                  (Step {stepIndex + 1} of {totalSteps})
                </span>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="max-w-5xl mx-auto mt-2">
              <div className="w-full h-1.5 bg-yellow-200 rounded">
                <div
                  className="h-1.5 bg-yellow-500 rounded transition-all duration-300"
                  style={{
                    width: `${((stepIndex + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* STEP */}
          <CurrentComponent onNext={handleNext} isOnboarding />
        </>
      )}
    </div>
  );
}
