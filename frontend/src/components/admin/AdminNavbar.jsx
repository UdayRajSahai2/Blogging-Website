// components/admin/AdminNavbar.jsx

import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../App";
import logo from "../../imgs/logo.png";

const AdminNavbar = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);

  const { access_token, fullname, profile_img } = userAuth || {};

  const handleLogout = () => {
    setUserAuth({ access_token: null });
    sessionStorage.removeItem("user");
  };

  return (
    <nav className=" bg-white shadow-md sticky top-0 z-50">
      <div className=" mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* 🔹 LEFT → BRAND (MERGED CLEANLY) */}
          <Link to="/admin" className="flex items-center gap-2">
            <img
              src={logo}
              className="w-8 h-8 object-contain rounded"
              alt="REACH Foundation"
            />
            <span className="text-sm sm:text-lg font-bold text-purple">
              REACH Foundation
            </span>

            {/* Divider */}
            <span className="hidden sm:inline text-gray-400">|</span>

            {/* Admin label */}
            <span className="text-xs sm:text-sm font-semibold text-black">
              Admin Panel
            </span>
          </Link>

          {/* 🔹 RIGHT → ACTIONS */}
          <div className="flex items-center gap-3">
            {/* GO TO SITE */}
            <Link
              to="/"
              className="text-sm text-gray-600 hover:underline hidden sm:block"
            >
              Go to Site
            </Link>

            {/* ADMIN NAME */}
            {access_token && fullname && (
              <span className="hidden md:block text-sm text-gray-700">
                Hi, {fullname.split(" ")[0]}
              </span>
            )}

            {/* PROFILE */}
            {access_token && (
              <div className="flex items-center gap-2">
                <img
                  src={profile_img}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border"
                />

                <button
                  onClick={handleLogout}
                  className="text-xs bg-black text-white px-3 py-1 rounded hidden sm:block"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 MOBILE SEARCH */}
        <div className="sm:hidden pb-2">
          <input
            type="text"
            placeholder="Search admin..."
            className="w-full h-9 px-3 border rounded-full"
          />
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
