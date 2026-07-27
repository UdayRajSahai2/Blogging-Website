// frontend/src/pages/onboarding/OnboardingPage.jsx

import axios from "axios";
import { USER_API } from "../../common/api";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import { completeOnboarding } from "../../api/auth.api";
import toast from "react-hot-toast";
import { storeInSession } from "../../common/session";
import {
  CheckCircleIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

import { onboardingSteps } from "../onboarding/onboarding.config";
import {
  getNextStep,
  getInitialStepFromData,
} from "../onboarding/onboarding.controller";

export default function OnboardingPage() {
  const { userAuth, setUserAuth } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const firstName = userAuth?.fullname?.split(" ")[0] || "there";

  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(20);

  // ONLY FIRST 3 STEPS
  const steps = onboardingSteps.slice(0, 3);

  const isStudent = userAuth?.education_status === "student";

  const hasProfessionalStep =
    userAuth?.employment_status === "employed" ||
    userAuth?.employment_status === "self_employed" ||
    userAuth?.employment_status === "retired";

  const visibleSteps = onboardingSteps.filter((step) => {
    switch (step.id) {
      case "profile":
        return true;

      case "academic":
        return true;

      case "professional":
        return hasProfessionalStep;

      default:
        return false;
    }
  });

  const hasAcademic =
    Array.isArray(userAuth?.academics) && userAuth.academics.length > 0;

  const isAcademicComplete = hasAcademic;

  const CurrentComponent =
    visibleSteps[stepIndex]?.component || visibleSteps[0]?.component;

  // =========================
  // URL helper (SAFE)
  // =========================
  const getStepFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("step");
  };

  // =========================
  // INIT STEP (NO LOOP)
  // =========================
  useEffect(() => {
    if (!visibleSteps?.length) return;

    const stepFromUrl = new URLSearchParams(location.search).get("step");

    const index = stepFromUrl
      ? visibleSteps.findIndex((s) => s.id === stepFromUrl)
      : 0;

    setStepIndex(index === -1 ? 0 : index);
  }, []);

  // =========================
  // SYNC URL (SAFE)
  // =========================
  useEffect(() => {
    if (!visibleSteps?.length) return;

    const stepFromUrl = new URLSearchParams(location.search).get("step");

    // NEW: check if academic already completed
    const hasAcademic = userAuth?.academics?.length > 0;

    let index = 0;

    if (stepFromUrl) {
      index = visibleSteps.findIndex((s) => s.id === stepFromUrl);
    } else {
      index = hasAcademic
        ? visibleSteps.findIndex((s) => s.id === "professional")
        : 0;
    }

    setStepIndex(index === -1 ? 0 : index);
  }, []);

  // =========================
  // GUARD MESSAGE
  // =========================
  useEffect(() => {
    if (location.state?.message) {
      toast(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // =========================
  // NEXT STEP
  // =========================
  const handleNext = () => {
    const nextIndex = stepIndex + 1;

    if (nextIndex < visibleSteps.length) {
      setStepIndex(nextIndex);
    } else {
      // Special case
      handleFinish();
    }
  };

  // =========================
  // FINISH
  // =========================
  const handleFinish = async () => {
    try {
      await completeOnboarding();

      const { data: updatedUser } = await axios.post(
        `${USER_API}/get-profile`,
        {
          username: userAuth.username,
        },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );

      // 3. Build updated auth object
      const updatedAuth = {
        ...updatedUser,
        access_token: userAuth.access_token,
      };

      // 4. Update context and session
      setUserAuth(updatedAuth);
      storeInSession("user", updatedAuth);

      // 5. Continue existing flow
      setCompleted(true);

      let time = 20;
      setCountdown(time);

      const interval = setInterval(() => {
        time--;
        setCountdown(time);

        if (time <= 0) {
          clearInterval(interval);
          navigate(`/dashboard/user/${updatedAuth.username}`, {
            replace: true,
          });
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const totalSteps = visibleSteps.length;

  // =========================
  // COMPLETED SCREEN
  // =========================
  if (completed) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-gray-50 px-0 sm:px-4">
        <div className="mt-4 w-full rounded-none border border-gray-200 bg-white p-6 text-center shadow-sm sm:max-w-lg sm:rounded-md sm:p-8">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            You're all set!
          </h1>

          {/* Message */}
          <p className="mt-2 text-sm text-gray-600 leading-6">
            Thanks, <span className="font-medium">{firstName}</span>. Your
            profile has been completed successfully.
          </p>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Tip:</span> You can complete or
              update your profile anytime from{" "}
              <span className="font-semibold">Settings</span>.
            </p>
          </div>

          {/* Countdown */}
          <p className="mt-5 text-sm text-gray-500">
            Redirecting to your dashboard in{" "}
            <span className="font-semibold text-gray-900">{countdown}s</span>
          </p>

          {/* Button */}
          <button
            onClick={() =>
              navigate(`/dashboard/user/${userAuth.username}`, {
                replace: true,
              })
            }
            className="mt-8 w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="w-full bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-sm py-2 px-4">
          {/* LEFT */}
          <div className="flex items-center gap-2 text-gray-700">
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-yellow-600" />
            <span>Complete your profile</span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 text-gray-600">
            <UserCircleIcon className="w-4 h-4 text-gray-500" />
            <span>
              {visibleSteps[stepIndex]?.label}
              <span className="ml-2 text-gray-500">
                ({stepIndex + 1}/{totalSteps})
              </span>
            </span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-1 bg-yellow-100">
          <div
            className="h-1 bg-yellow-500 transition-all duration-300"
            style={{
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* STEP */}
      <CurrentComponent onNext={handleNext} isOnboarding />
    </div>
  );
}
