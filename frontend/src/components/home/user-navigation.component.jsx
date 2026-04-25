import { useContext, useState } from "react";
import AnimationWrapper from "../../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
import { removeFromSession } from "../../common/session";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
      // (Optional API call — skip if not needed)
      // await axios.post(AUTH_API + "/logout");
    } catch (err) {
      console.warn("Logout API failed");
    } finally {
      // Clear session
      removeFromSession("user");

      setUserAuth({
        access_token: null,
        profile_img: null,
        username: null,
        system_role: null,
        isOnboardingCompleted: null,
      });

      // Toast update (IMPORTANT FIX)
      toast.success("Logged out successfully", { id: toastId });

      // Redirect
      navigate("/signin", { replace: true });

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
            <img
              src={profile_img}
              alt="Profile"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-300"
            />

            <div className="leading-tight">
              {/* Full Name */}
              <p className="font-semibold text-gray-800">{fullname}</p>

              {/* Username */}
              <p className="text-xs text-gray-500">@{username}</p>

              {/* Role */}
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
          className="md:hidden block px-4 py-3 bg-purple text-white text-center font-medium hover:bg-purple transition-colors"
        >
          <i className="fi fi-rr-file-edit mr-2"></i>
          Post your blog
        </Link>

        {/* Main Navigation */}
        <div className="py-2">
          {["admin", "super_admin"].includes(role) && (
            <Link
              to="/admin"
              className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-semibold"
            >
              <i className="fi fi-rr-shield mr-3"></i>
              Admin Panel
            </Link>
          )}

          <Link
            to={`dashboard/user/${username}`}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <i className="fi fi-rr-user mr-3 text-purple-600"></i>
            My Profile
          </Link>

          <Link
            to="/dashboard/blogs"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <i className="fi fi-rr-document mr-3 text-purple-600"></i>
            My Blogs
          </Link>
          <Link
            to="/settings/edit-profile"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <i className="fi fi-rr-settings mr-3 text-purple-600"></i>
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
          <i className="fi fi-rr-sign-out mr-3"></i>
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
{
  /* disabled in production */
}
{
  /* <Link
            to="/events/my"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-calendar mr-3 text-purple-600"></i>
            My Events
          </Link> */
}

{
  /* disabled in production */
}
{
  /* <Link
            to="/chat"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-messages mr-3 text-purple-600"></i>
            My Chats
          </Link> */
}
{
  /*  DASHBOARD for multiple roles disabled */
}
{
  /* <Link
            to="/dashboard-home"
            className="flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-all font-medium"
          >
            <i className="fi fi-rr-apps mr-3"></i>
            Dashboard
          </Link> */
}
