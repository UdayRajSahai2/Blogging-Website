import { useContext, useState, useRef, useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../App";

import DocumentTextIcon from "@heroicons/react/24/solid/DocumentTextIcon";
import BellIcon from "@heroicons/react/24/solid/BellIcon";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import BriefcaseIcon from "@heroicons/react/24/solid/BriefcaseIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import FolderIcon from "@heroicons/react/24/solid/FolderIcon";
import ChatBubbleLeftRightIcon from "@heroicons/react/24/solid/ChatBubbleLeftRightIcon";
import HomeIcon from "@heroicons/react/24/solid/HomeIcon";
import HeartIcon from "@heroicons/react/24/solid/HeartIcon";
import Bars3Icon from "@heroicons/react/24/solid/Bars3Icon";
const SideNav = () => {
  const location = useLocation();
  const {
    userAuth: { username, access_token, new_notification_available },
  } = useContext(UserContext);

  // Hooks are always called first
  const [pageState, setPageState] = useState(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return (parts[2] || parts[1] || "dashboard").replace(/-/g, " ");
  });
  const [showSideNav, setShowSideNav] = useState(false);

  const activeTabLine = useRef(null);
  const sideBarIconTab = useRef(null);
  const pageStateTab = useRef(null);

  const changePageState = (e) => {
    const { offsetWidth, offsetLeft } = e.target;

    if (activeTabLine.current) {
      activeTabLine.current.style.width = offsetWidth + "px";
      activeTabLine.current.style.left = offsetLeft + "px";
    }

    if (e.target === sideBarIconTab.current) {
      setShowSideNav(true);
    } else if (e.target === pageStateTab.current) {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setPageState(() => {
      const parts = location.pathname.split("/").filter(Boolean);
      return (parts[2] || parts[1] || "dashboard").replace(/-/g, " ");
    });
    setShowSideNav(false);

    if (pageStateTab.current) {
      pageStateTab.current.click();
    }
  }, [location.pathname]);

  const handleNavLinkClick = (e) => setPageState(e.target.innerText);

  //  Conditional render comes AFTER hooks
  if (!access_token) return <Navigate to="/signin" replace />;

  return (
    <section className="relative flex flex-col md:flex-row gap-0 w-full m-0 p-0">
      {/* SIDEBAR */}
      <div className="sticky top-[80px] z-20 flex-shrink-0">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden sticky top-[80px] z-40 bg-white border-b flex items-center h-14 px-2">
          {/* Toggle Sidebar */}
          <button
            ref={sideBarIconTab}
            onClick={changePageState}
            aria-label="Toggle sidebar navigation"
            aria-expanded={showSideNav}
            aria-controls="sidebar-navigation"
            className="px-4 h-full flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Bars3Icon className="w-6 h-6 pointer-events-none" />
          </button>

          {/* Current Page */}
          <button
            ref={pageStateTab}
            onClick={changePageState}
            className="px-4 h-full flex items-center capitalize font-medium focus:outline-none"
            aria-label={`Current tab: ${pageState}`}
          >
            {pageState}
          </button>

          {/* Active Tab Line */}
          <span
            ref={activeTabLine}
            className="absolute bottom-0 h-[2px] bg-black duration-300"
            aria-hidden="true"
          />

          <div className="w-10" />
        </div>

        {/* SIDEBAR NAV */}
        <nav
          id="sidebar-navigation"
          aria-label="Dashboard navigation"
          className={
            "min-w-[180px] md:min-w-[100px] h-[calc(100vh-80px)] lg:h-full md:sticky overflow-y-auto px-0  md:pr-1 border border-gray-200 absolute max-md:top-[56px] bg-white w-full md:w-auto duration-200" +
            (!showSideNav
              ? " max-md:opacity-0 max-md:pointer-events-none"
              : " opacity-100 pointer-events-auto")
          }
        >
          {/* DASHBOARD */}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-normal px-2">
            Dashboard
          </h4>
          <div className="h-px bg-gray-200 my-1 ml-3 mr-1" />
          <NavLink
            to="/"
            onClick={handleNavLinkClick}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <HomeIcon className="w-5 h-5" aria-hidden="true" />
            Home
          </NavLink>
          <NavLink
            to="/dashboard/blogs"
            onClick={handleNavLinkClick}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <DocumentTextIcon className="w-5 h-5" aria-hidden="true" />
            Blogs
          </NavLink>
          <NavLink
            to="/editor"
            onClick={handleNavLinkClick}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
            Post blog
          </NavLink>

          {/* disabled in production */}
          {/* <NavLink
            to="/chat"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Chat
          </NavLink> */}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-normal px-2">
            Profile
          </h4>
          <div className="h-px bg-gray-200 my-2 ml-3 mr-1" />
          <NavLink
            to={`/dashboard/user/${username}`}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <UserIcon className="w-5 h-5" aria-hidden="true" />
            My Profile
          </NavLink>
          <NavLink
            to="/dashboard/academics"
            onClick={handleNavLinkClick}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <AcademicCapIcon className="w-5 h-5" aria-hidden="true" />
            Education
          </NavLink>
          <NavLink
            to="/dashboard/professional-profile"
            onClick={handleNavLinkClick}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <BriefcaseIcon className="w-5 h-5" aria-hidden="true" />
            Experience
          </NavLink>

          {/* disabled in production */}
          {/* <NavLink
            to="/dashboard/connections"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <UserIcon className="w-5 h-5" aria-hidden="true" />
            My Connections
          </NavLink> */}

          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-normal px-2">
            Activity
          </h4>
          <div className="h-px bg-gray-200 my-2 ml-3 mr-1" />
          <NavLink
            to="/dashboard/donor"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <HeartIcon className="w-5 h-5" aria-hidden="true" />
            My Donations
          </NavLink>

          <NavLink
            to="/dashboard/notifications"
            onClick={handleNavLinkClick}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <div className="relative">
              <BellIcon className="w-5 h-5" aria-hidden="true" />

              {new_notification_available && (
                <span
                  className="bg-red-500 w-2 h-2 rounded-full absolute top-0 right-0"
                  role="status"
                  aria-label="New notifications available"
                ></span>
              )}
            </div>
            Notification
          </NavLink>

          {/* SETTINGS */}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-normal px-2">
            Settings
          </h4>
          <div className="h-px bg-gray-200 my-2 ml-3 mr-1" />
          <NavLink
            to="/settings/edit-profile"
            onClick={handleNavLinkClick}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <UserCircleIcon className="w-5 h-5" aria-hidden="true" />
            Edit Profile
          </NavLink>
          <NavLink
            to="/settings/change-password"
            onClick={handleNavLinkClick}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }
          >
            <LockClosedIcon className="w-5 h-5" aria-hidden="true" />
            Change Password
          </NavLink>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </div>
    </section>
  );
};

export default SideNav;
