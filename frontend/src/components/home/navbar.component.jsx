//frontend\src\components\navbar.component.jsx
import { useContext, useEffect, useState, useRef } from "react";
import logo from "../../imgs/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { NOTIFICATION_API } from "../../common/api";
import NotificationPanel from "../notification/notification-panel.component";

const Navbar = ({ onInterestClick, activeInterest }) => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const notificationRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const {
    userAuth,
    userAuth: { access_token, profile_img, fullname },
    setUserAuth,
  } = useContext(UserContext);

  const navigate = useNavigate();

  // 1. Unified Notification Logic
  // fetch function
  const fetchNotificationCount = async () => {
    try {
      const { data } = await axios.get(`${NOTIFICATION_API}/unread-count`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setNotificationCount(data.unreadCount);
    } catch (err) {
      console.error("Notification count error:", err);
    }
  };

  // polling
  useEffect(() => {
    let interval;

    if (access_token) {
      fetchNotificationCount();
      interval = setInterval(fetchNotificationCount, 120000);
    }

    return () => clearInterval(interval);
  }, [access_token]);

  const handleUserNavPanel = () => {
    setUserNavPanel((val) => !val);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Debounced Search (Crucial for UX)
  const handleSearch = (e) => {
    let query = e.target.value.trim();
    if (e.keyCode === 13 && query.length > 2) {
      navigate(`/search/${query}`);
    }
  };
  const handleNotificationClick = async () => {
    setShowNotifications((prev) => !prev);

    if (!showNotifications) {
      const { data } = await axios.get(`${NOTIFICATION_API}/new-notification`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setNotifications(data.notifications);

      setNotificationCount(0); // remove badge
    }
  };

  const handleBlur = () => {
    setTimeout(() => setUserNavPanel(false), 200);
  };

  // Combined interests + categories
  const tags = [
    "Programming",
    "Hollywood",
    "Anime",
    "Film making",
    "Social Media",
    "Cooking",
    "Tech",
    "Finances",
    "Travel",
    "Food",
    "Connect to people",
    "Science & Technology",
    "Health & Nutrition",
    "Sports",
    "Political",
    "Social",
    "News",
    "Celebrity talk",
  ];

  const handleTagClick = (tag) => {
    const formattedTag = tag.toLowerCase();
    if (onInterestClick) {
      onInterestClick(formattedTag);
    }
  };

  return (
    <>
      {/* Top Banner */}
      {/* <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs py-1 text-center">
        REACH Foundation - Build Your Community & Share Your Voice{" "}
      </div> */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-auto px-1 sm:px-6">
          {/* MAIN NAVBAR */}
          <div className="flex items-center justify-between h-14">
            {/* LEFT → LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3 leading-none hover:opacity-90 transition"
            >
              <img
                src={logo}
                className="w-12 h-12 object-contain"
                alt="REACH Foundation"
              />
              <span className="text-sm sm:text-lg font-bold text-purple tracking-tight whitespace-nowrap">
                REACH{" "}
                <span className="font-medium text-gray-600 hidden sm:inline">
                  Foundation
                </span>
              </span>
            </Link>

            {/* CENTER → SEARCH (DESKTOP) */}
            <div className="hidden sm:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search profiles, blogs..."
                  className="w-full h-9 pl-10 pr-4 rounded-full border bg-gray-50 focus:ring-2 focus:ring-purple-500"
                  onKeyDown={handleSearch}
                />
                <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* CENTER → WELCOME (DESKTOP) */}
            {access_token && fullname && (
              <div className="hidden md:block text-sm text-cyan-700 font-medium whitespace-nowrap">
                Hi, {fullname}
                {userAuth.customer_id && (
                  <span className="ml-1 text-cyan-600 text-xs">
                    (CIF: {userAuth.customer_id})
                  </span>
                )}
              </div>
            )}

            {/* RIGHT → ACTIONS */}
            <div className="flex items-center gap-2">
              {/* MOBILE SEARCH */}
              <button
                className="sm:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                onClick={() => setSearchBoxVisibility(!searchBoxVisibility)}
              >
                <i className="fi fi-rr-search text-xl text-gray-700"></i>
              </button>

              {!access_token ? (
                <>
                  <Link
                    to="/signin"
                    className="text-purple font-semibold text-sm px-2"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="bg-purple text-white px-3 py-1.5 rounded-full text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {/* POST */}
                  <Link
                    to="/editor"
                    className="hidden sm:flex bg-purple text-white px-3 py-1.5 rounded-full text-sm items-center gap-1"
                  >
                    <i className="fi fi-rr-edit"></i>
                    Post
                  </Link>

                  {/* CHAT */}
                  <button
                    onClick={() => navigate("/chat")}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    <i className="fi fi-rr-comment text-xl text-gray-700"></i>
                  </button>

                  {/* NOTIFICATIONS */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleNotificationClick}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition relative"
                    >
                      <i className="fi fi-rr-bell text-xl text-gray-700"></i>

                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                          {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <NotificationPanel notifications={notifications} />
                    )}
                  </div>

                  {/* PROFILE */}
                  <div
                    className="relative"
                    onClick={handleUserNavPanel}
                    onBlur={handleBlur}
                  >
                    <button className="w-10 h-10 rounded-full overflow-hidden border hover:shadow-sm transition">
                      <img
                        src={profile_img}
                        className="w-full h-full object-cover"
                        alt="Profile"
                      />
                    </button>

                    {userNavPanel && <UserNavigationPanel />}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* MOBILE SEARCH */}
          {searchBoxVisibility && (
            <div className="sm:hidden pb-2">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 px-3 border rounded-full"
                onKeyDown={handleSearch}
              />
            </div>
          )}

          {/* MOBILE WELCOME */}
          {access_token && fullname && (
            <div className="md:hidden text-center text-xs text-cyan-700 pb-2">
              Welcome, {fullname.split(" ")[0]}
              {userAuth.customer_id && (
                <span className="ml-1 text-cyan-600">
                  (CIF: {userAuth.customer_id})
                </span>
              )}
            </div>
          )}

          {/* INTERESTS */}
          <div className="border-t py-1">
            <div className="flex gap-2 items-center">
              <span className="font-bold text-red-500 flex items-center gap-1">
                Interests <i className="fi fi-rr-heart"></i>
              </span>

              <div className="flex flex-wrap gap-2 max-h-[65px] overflow-y-auto">
                {tags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleTagClick(tag)}
                    className={`px-1 py-1 text-sm font-semibold text-white rounded-2xl ${
                      activeInterest === tag.toLowerCase()
                        ? "bg-black"
                        : "bg-purple hover:bg-purple"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
