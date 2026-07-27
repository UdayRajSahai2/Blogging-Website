import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { UserContext } from "../../App";
import logo from "../../imgs/logo.png";
import UserAvatar from "../../common/UserAvatar";

const AdminNavbar = ({ onMenuClick }) => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const { access_token, fullname, profile_img } = userAuth || {};

  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setUserAuth({ access_token: null });
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto px-3 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <button
              onClick={onMenuClick}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-100"
            >
              ☰
            </button>

            {/* Brand */}
            <Link to="/admin" className="flex items-center gap-2">
              <img
                src={logo}
                className="h-8 w-8 rounded object-contain"
                alt="REACH Foundation"
              />

              <span className="text-sm font-bold text-purple sm:text-lg">
                REACH Foundation
              </span>

              <span className="hidden text-gray-400 sm:inline">|</span>

              <span className="hidden text-sm font-semibold text-black sm:inline">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Go To Site */}
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-black hover:underline font-medium"
            >
              <span className="sm:hidden">Site</span>
              <span className="hidden sm:inline">View Site</span>
            </Link>

            {/* Welcome */}
            {access_token && fullname && (
              <span className="hidden lg:block text-sm text-gray-700 font-semibold">
                Hi, {fullname.split(" ")[0]}
              </span>
            )}

            {/* Profile */}
            {access_token && (
              <div className="flex items-center gap-2">
                <UserAvatar
                  src={profile_img}
                  name={fullname}
                  className="h-9 w-9"
                  ringClassName="ring-gray-200"
                />

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded bg-black px-3 py-1 text-xs text-white transition hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="border-t border-gray-100 py-2 md:hidden">
          <input
            type="text"
            placeholder="Search admin..."
            className="h-9 w-full rounded-full border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
          />
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
