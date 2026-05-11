//frontend\src\components\navbar.component.jsx
import { useContext, useEffect, useState, useRef } from "react";
import logo from "../../imgs/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { NOTIFICATION_API } from "../../common/api";
import NotificationPanel from "../notification/notification-panel.component";
import NavbarMenu from "../menubar/NavbarMenu";

import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  FaYoutube,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaGithub,
  FaWhatsapp,
  FaGlobe,
} from "react-icons/fa";
const Navbar = ({ onInterestClick, activeInterest, profile }) => {
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
  const socialIcons = {
    youtube: FaYoutube,
    instagram: FaInstagram,
    facebook: FaFacebookF,
    twitter: FaTwitter,
    github: FaGithub,
    website: FaGlobe,
    whatsapp: FaWhatsapp,
  };
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

  return (
    <>
      {/* Top Banner */}
      {/* <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs py-1 text-center">
        REACH Foundation - Build Your Community & Share Your Voice{" "}
      </div> */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="w-full max-w-full px-0 md:px-2">
          {/* ================= DESKTOP (UNCHANGED) ================= */}
          <div className="hidden md:flex mt-1 items-start justify-between h-20">
            {/* ================= LEFT → LOGO ================= */}
            <Link to="/" className="flex items-start gap-2 shrink-0 -ml-4">
              <img
                src={logo}
                className="w-10 h-10 md:w-[92px] md:h-[92px] object-contain -mt-2"
                alt="REACH Foundation"
              />

              <span className="hidden md:block text-lg font-bold text-purple mt-4">
                REACH{" "}
                <span className="text-gray-600 font-medium">Foundation</span>
              </span>
            </Link>
            {/* RIGHT SIDE (independent alignment) */}
            <div className="flex items-center justify-end gap-4 flex-1">
              {/* ================= SEARCH ================= */}
              <div className="relative min-w-[160px] flex-1 max-w-[220px] md:max-w-md">
                <input
                  type="text"
                  placeholder="Search profiles,blogs..."
                  className="w-full h-8 md:h-10 pl-8 md:pl-10 pr-2 md:pr-4 text-xs md:text-sm rounded-full border bg-gray-50 focus:ring-2 focus:ring-purple-500"
                  onKeyDown={handleSearch}
                />
                <MagnifyingGlassIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-2 md:left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* ================= WELCOME ================= */}
              {access_token && fullname && (
                <div className="text-xs md:text-sm text-cyan-700 truncate max-w-[120px] md:max-w-none shrink-0">
                  Welcome, {fullname}
                  {userAuth.customer_id && (
                    <span className="ml-1 text-cyan-600 text-xs hidden md:inline">
                      (CIF: {userAuth.customer_id})
                    </span>
                  )}
                </div>
              )}

              {/* ================= SOCIAL ICONS ================= */}
              <div className="flex items-center gap-[2px] shrink-0">
                {[
                  "youtube",
                  "instagram",
                  "facebook",
                  "twitter",
                  "github",
                  "website",
                  "whatsapp",
                ].map((key) => {
                  const link = profile?.details?.[key];

                  const Icon = socialIcons[key];

                  return (
                    <a
                      key={key}
                      href={link || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!link) e.preventDefault();
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-purple-600 hover:bg-purple-100 transition text-[11px]"
                    >
                      <Icon />
                    </a>
                  );
                })}

                {/* CART */}
                <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-purple-600 hover:bg-purple-100 transition">
                  <ShoppingCartIcon className="w-4 h-4" />
                </button>
              </div>

              {/* ================= RIGHT ACTIONS ================= */}
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                {!access_token ? (
                  <>
                    <Link
                      to="/signin"
                      className="text-purple font-semibold text-xs md:text-sm px-1 md:px-2"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      className="bg-purple text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    {/* POST */}
                    <Link
                      to="/editor"
                      className="bg-purple text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center gap-1"
                    >
                      <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden md:inline">Post blog</span>
                    </Link>

                    {/* NOTIFICATIONS */}
                    <div className="relative" ref={notificationRef}>
                      <button
                        onClick={handleNotificationClick}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <BellIcon className="w-4 h-4  text-gray-700" />

                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] md:text-[10px] px-1 rounded-full">
                            {notificationCount > 99 ? "99+" : notificationCount}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <NotificationPanel notifications={notifications} />
                      )}
                    </div>
                    {/* disabled in production */}
                    {/* CHAT */}
                    {/* <button
                      onClick={() => navigate("/chat")}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4 text-gray-700" />
                    </button> */}

                    {/* PROFILE */}
                    <div
                      className="relative"
                      onClick={handleUserNavPanel}
                      onBlur={handleBlur}
                    >
                      <button className="w-8 h-8 md:w-8 md:h-8 rounded-full overflow-hidden ring-2 ring-purple-400 ring-offset-2 ring-offset-white">
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
          </div>
          {/* ================= MOBILE ================= */}
          <div className="md:hidden">
            {/*  ROW 1 */}
            <div className="flex items-center justify-between min-w-0 px-2">
              {/* LOGO */}
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} className="w-14 h-14 object-contain" />
                <span className="text-base font-bold text-purple whitespace-nowrap">
                  REACH{" "}
                  <span className="font-medium text-gray-600">Foundation</span>
                </span>
              </Link>

              {/* ACTIONS */}
              <div className="flex md:hidden items-center">
                {!access_token ? (
                  <>
                    <Link
                      to="/signin"
                      className="text-purple font-semibold text-xs px-2"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      className="bg-purple text-white px-2 py-1 rounded-full text-xs"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    {/* POST */}
                    <Link
                      to="/editor"
                      className="flex items-center gap-1 bg-purple text-white px-2 py-[2px] rounded-full text-[10px] whitespace-nowrap shrink-0"
                    >
                      <PencilSquareIcon className="w-3 h-3" />
                      <span className="hidden xs:inline">Post</span>
                    </Link>

                    {/* SEARCH ICON */}
                    <div className="relative">
                      {/* SEARCH ICON */}
                      <button
                        onClick={() => setSearchBoxVisibility((prev) => !prev)}
                        className="w-7 h-7 flex items-center justify-center"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-700" />
                      </button>

                      {/* SEARCH DROPDOWN */}
                      {searchBoxVisibility && (
                        <div className="absolute right-0 top-full mt-2 w-[220px] z-50">
                          <div className="relative">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const query = e.target.search.value.trim();

                                if (query.length < 3) return;

                                navigate(
                                  `/search/${encodeURIComponent(query)}`,
                                );
                                setSearchBoxVisibility(false);
                              }}
                            >
                              <input
                                name="search"
                                type="search"
                                enterKeyHint="search"
                                placeholder="Search blogs,profiles..."
                                className="w-full h-8 pl-8 pr-2 text-xs rounded-full border bg-white shadow-md"
                                autoFocus
                              />
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* CART */}
                    <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-purple-600 hover:bg-purple-100 transition">
                      <ShoppingCartIcon className="w-4 h-4" />
                    </button>

                    {/* NOTIFICATION */}
                    <div className="relative" ref={notificationRef}>
                      <button
                        onClick={handleNotificationClick}
                        className="w-8 h-8 flex items-center justify-center relative"
                      >
                        <BellIcon className="w-4 h-4" />

                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1 rounded-full">
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
                      onClick={handleUserNavPanel}
                      onBlur={handleBlur}
                      className="relative"
                    >
                      <img
                        src={profile_img}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-purple-400 ring-offset-2 ring-offset-white"
                      />
                      {userNavPanel && <UserNavigationPanel />}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/*  ROW 2 → WELCOME + CIF + SOCIAL ICONS */}
            {access_token && fullname && (
              <div className="flex items-center justify-between px-1 pb-1 gap-2">
                {/* LEFT */}
                <div className="text-[11px] text-cyan-700 truncate flex-1 min-w-0">
                  Welcome, {fullname}
                  {userAuth.customer_id && (
                    <span className="ml-1 text-cyan-600 whitespace-nowrap">
                      | CIF: {userAuth.customer_id}
                    </span>
                  )}
                </div>

                {/* RIGHT → Social Icons (small) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {[
                    "youtube",
                    "instagram",
                    "facebook",
                    "twitter",
                    "github",
                    "website",
                    "whatsapp",
                  ].map((key) => {
                    const link = profile?.details?.[key];

                    const Icon = socialIcons[key];

                    return (
                      <a
                        key={key}
                        href={link || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!link) e.preventDefault();
                        }}
                        className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-100 text-[9px] flex-shrink-0"
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* MENU */}
          <NavbarMenu />
        </div>
        <div></div>
      </nav>
    </>
  );
};

export default Navbar;
