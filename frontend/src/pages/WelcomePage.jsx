import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import { useEffect } from "react";
import {
  CheckBadgeIcon,
  IdentificationIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
const WelcomePage = () => {
  const navigate = useNavigate();
  const { userAuth, setUserAuth } = useContext(UserContext);

  const user = userAuth;

  const signOutUser = () => {
    removeFromSession("user");

    setUserAuth({
      access_token: null,
      profile_img: null,
      username: null,
      system_role: null,
    });

    navigate("/signin", { replace: true });
  };
  useEffect(() => {
    if (userAuth?.isOnboardingCompleted) {
      navigate("/");
    }
  }, [userAuth]);
  if (!user?.access_token) return null;

  return (
    <div className="min-h-fit w-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 sm:px-6 md:px-8 py-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl text-center">
        {/*  Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <SparklesIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />
          Welcome, {user?.fullname || user?.username}!
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 flex items-start sm:items-center justify-center gap-2">
          <CheckBadgeIcon className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          Your account has been successfully created and is ready to go
        </p>

        {/*  Avatar */}
        <img
          src={user?.profile_img || "/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border mb-5 mx-auto"
        />

        {/* Customer ID */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-6 shadow-sm text-center">
          <p className="text-[11px] sm:text-xs text-gray-500 flex items-center justify-center gap-1">
            <IdentificationIcon className="w-4 h-4 text-blue-500" />
            Customer ID
          </p>

          <p className="font-semibold text-gray-800 text-base sm:text-lg mt-1">
            #{user?.customer_id || "CUST-XXXX"}
          </p>
        </div>

        {/* Profile Status */}
        <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
          Complete your profile in just a few seconds to unlock full access and
          start getting discovered
        </p>

        {/*  Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={() => navigate("/onboarding")}
            className="w-full py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Complete Your Profile →
          </button>

          <button
            onClick={signOutUser}
            className="w-full py-2 text-sm sm:text-base bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
export default WelcomePage;
