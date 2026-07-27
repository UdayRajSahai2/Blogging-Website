import { useContext, useState } from "react";
import AnimationWrapper from "../../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
import { logoutUser } from "../../api/auth.api";
import { removeFromSession } from "../../common/session";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserAvatar from "../../common/UserAvatar";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import Cog6ToothIcon from "@heroicons/react/24/outline/Cog6ToothIcon";
import ArrowRightOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightOnRectangleIcon";
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
const UserNavigationPanel = () => {
  const navigate = useNavigate();
  const { userAuth, setUserAuth } = useContext(UserContext);
  const [loggingOut, setLoggingOut] = useState(false);
  const username = userAuth?.username;
  const fullname = userAuth?.fullname;
  const profile_img = userAuth?.profile_img;
  const role = userAuth?.role;

  const signOutUser = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    const toastId = toast.loading("Signing out...");

    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout API failed");
    } finally {
      removeFromSession("user");

      setUserAuth({
        access_token: null,
        profile_img: null,
        username: null,
        system_role: null,
        isOnboardingCompleted: null,
      });

      toast.success("Logged out successfully", {
        id: toastId,
      });

      navigate("/signin", {
        replace: true,
      });

      setLoggingOut(false);
    }
  };

  return (
    <AnimationWrapper
      className="absolute right-0 z-50"
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white shadow-2xl rounded-xl w-64 mt-2 border border-gray-200 overflow-hidden">
        {/* Compact User Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <UserAvatar
              src={profile_img}
              name={fullname}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-300"
            />
            <div className="leading-tight">
              {/* Full Name */}
              <p className="font-semibold text-gray-800">{fullname}</p>

              {/* Username */}
              <p className="text-xs text-gray-500">@{username}</p>

              {/* System  Role */}
              <p className="text-[11px] text-gray-400 mt-0.5">
                {role === "super_admin"
                  ? "Super Admin"
                  : role === "admin"
                    ? "Administrator"
                    : "Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Write Button (Mobile Only) */}
        <Link
          to="/editor"
          className="md:hidden flex items-center justify-center gap-2 px-1 py-1 bg-purple text-white text-sm font-medium hover:bg-purple transition-colors"
        >
          <PencilSquareIcon className="w-4 h-4 shrink-0" />
          Post blog
        </Link>

        {/* Main Navigation */}
        <div className="py-2">
          {["admin", "super_admin"].includes(role) && (
            <Link
              to="/admin"
              className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-semibold"
            >
              <ShieldCheckIcon className="w-4 h-4 mr-3" />
              Admin Panel
            </Link>
          )}

          <Link
            to={`dashboard/user/${username}`}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <UserIcon className="w-4 h-4 mr-3 text-purple-600" />
            My Profile
          </Link>

          <Link
            to="/dashboard/blogs"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4 mr-3 text-purple-600" />
            My Blogs
          </Link>
          <Link
            to="/settings/edit-profile"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-3 text-purple-600" />
            Settings
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mx-2" />

        {/* Sign Out */}
        <button
          onClick={signOutUser}
          disabled={loggingOut}
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
          <div className="text-left">
            <p className="font-medium">
              {loggingOut ? "Signing out..." : "Sign Out"}
            </p>
            <p className="text-xs text-gray-500">@{username}</p>
          </div>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
