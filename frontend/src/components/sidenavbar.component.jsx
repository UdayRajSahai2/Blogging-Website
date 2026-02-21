import { useContext, useState, useRef, useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../App";

const SideNav = () => {
  const location = useLocation();
  const {
    userAuth: { access_token, new_notification_available },
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

  // 🔐 Conditional render comes AFTER hooks
  if (!access_token) return <Navigate to="/signin" replace />;

  return (
    <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
      {/* SIDEBAR */}
      <div className="sticky top-[80px] z-30">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden bg-white py-1 border-b border-grey flex overflow-x-auto relative">
          <button
            ref={sideBarIconTab}
            className="p-5 capitalize"
            onClick={changePageState}
          >
            <i className="fi fi-bs-bars-staggered pointer-events-none"></i>
          </button>

          <button
            ref={pageStateTab}
            className="p-5 capitalize"
            onClick={changePageState}
          >
            {pageState}
          </button>

          <hr ref={activeTabLine} className="absolute bottom-0 duration-500" />
        </div>

        {/* SIDEBAR CONTENT */}
        <div
          className={
            "min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500" +
            (!showSideNav
              ? " max-md:opacity-0 max-md:pointer-events-none"
              : " opacity-100 pointer-events-auto")
          }
        >
          <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
          <hr className="border-grey -ml-6 mb-8 mr-6" />

          <NavLink
            to="/dashboard/blogs"
            onClick={handleNavLinkClick}
            className="sidebar-link"
          >
            <i className="fi fi-rr-document"></i>
            Blogs
          </NavLink>

          <NavLink
            to="/dashboard/notifications"
            onClick={handleNavLinkClick}
            className="sidebar-link"
          >
            <div className="relative">
              <i className="fi fi-rr-bell"></i>
              {new_notification_available && (
                <span className="bg-red w-2 h-2 rounded-full absolute top-0 right-0"></span>
              )}
            </div>
            Notification
          </NavLink>

          <NavLink
            to="/editor"
            onClick={handleNavLinkClick}
            className="sidebar-link"
          >
            <i className="fi fi-rr-file-edit"></i>
            Post your blog
          </NavLink>

          <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
          <hr className="border-grey -ml-6 mb-8 mr-6" />

          <NavLink
            to="/settings/edit-profile"
            onClick={handleNavLinkClick}
            className="sidebar-link"
          >
            <i className="fi fi-rr-user-pen"></i>
            Edit Profile
          </NavLink>

          <NavLink
            to="/settings/change-password"
            onClick={handleNavLinkClick}
            className="sidebar-link"
          >
            <i className="fi fi-rr-lock"></i>
            Change Password
          </NavLink>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-md:-mt-8 mt-5 w-full">
        <Outlet />
      </div>
    </section>
  );
};

export default SideNav;
