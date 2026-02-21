//frontend\src\components\navbar.component.jsx
import { useContext, useEffect, useState, useRef } from "react";
import logo from "../imgs/logo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { NOTIFICATION_API } from "../common/api";
import NotificationPanel from "./notification-panel.component";

const Navbar = ({ onInterestClick, activeInterest }) => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const notificationRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const {
    userAuth,
    userAuth: { access_token, profile_img, fullname },
    setUserAuth,
  } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (access_token) {
      axios
        .get(`${NOTIFICATION_API}/new-notification`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) =>
          setUserAuth({
            ...userAuth,
            new_notification_available: data.hasNew,
          }),
        )
        .catch((err) => console.log(err));
    }
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

  const handleSearch = (e) => {
    let query = e.target.value;
    if (e.keyCode === 13 && query.length) {
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
      setUserAuth({
        ...userAuth,
        new_notification_available: false,
      });
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 text-sm">
        <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto text-center">
          <i className="fi fi-rr-users text-base"></i>
          <span className="font-medium">
            Connect Me - Build Your Community & Share Your Voice
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: Logo - Welcome - Right Icons */}
          <div className="grid grid-cols-3 items-center py-4 sm:py-3">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src={logo}
                  className="w-10 h-10 object-contain rounded"
                  alt="Connect Me"
                />
                <span className="hidden sm:inline text-2xl font-bold text-purple">
                  Connect Me
                </span>
              </Link>
            </div>

            {/* Center: Welcome */}
            <div className="flex justify-center">
              <span className="text-[17px] sm:text-lg font-semibold text-cyan-700 text-center">
                Welcome{access_token && fullname && `: ${fullname}`}
                {userAuth.customer_id && (
                  <span className="ml-1 text-sm font-normal text-cyan-600">
                    (CIF: {userAuth.customer_id})
                  </span>
                )}
              </span>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center justify-end gap-2">
              <button
                className="md:hidden w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                onClick={() => setSearchBoxVisibility(!searchBoxVisibility)}
              >
                <i className="fi fi-rr-search text-lg text-gray-600"></i>
              </button>

              {!access_token ? (
                <>
                  <Link
                    className="text-purple font-semibold px-3 py-2 rounded-lg hover:bg-purple/10 transition-all"
                    to="/signin"
                  >
                    Login
                  </Link>
                  <Link
                    className="bg-purple text-white px-4 py-2 rounded-full font-semibold hover:shadow-md transform hover:scale-105 transition-all duration-200"
                    to="/signup"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/editor"
                    className="bg-purple text-white font-semibold px-4 py-2 rounded-full shadow-md hover:bg-purple/90 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <i className="fi fi-rr-edit text-base"></i>
                    <span className="sm:inline">Post your blog</span>
                  </Link>

                  <Link
                    to="/chat"
                    className="text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-gray-100 transition-all flex items-center gap-1"
                  >
                    <i className="fi fi-rr-comment text-xl"></i>
                    <span className="hidden lg:inline font-medium text-sm">
                      Chat
                    </span>
                  </Link>

                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleNotificationClick}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <i className="fi fi-rr-bell text-xl text-gray-600"></i>
                    </button>

                    {showNotifications && (
                      <NotificationPanel notifications={notifications} />
                    )}
                  </div>

                  <div
                    className="relative"
                    onClick={handleUserNavPanel}
                    onBlur={handleBlur}
                  >
                    <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
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

          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto mb-4 px-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search profiles, blogs, events..."
                className="w-full h-10 pl-12 pr-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                onKeyDown={handleSearch}
              />
              <i className="fi fi-rr-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Interests Tags - Fixed styling and functionality */}
          <div className="border-t border-gray-100 py-3 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-base flex-shrink-0 flex items-center gap-1 mr-2">
                Interests{" "}
                <i className="fi fi-rr-heart text-red-500 text-lg"></i>
              </span>

              <div className="max-h-[80px] overflow-y-auto">
                <div className="flex flex-wrap gap-2 pb-2">
                  {tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tag)}
                      className={`whitespace-nowrap px-4 py-2 text-sm font-semibold text-white ${
                        activeInterest === tag.toLowerCase()
                          ? "bg-black"
                          : "bg-green-500 hover:bg-green-600"
                      } rounded-full transition-all duration-200 flex-shrink-0`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Added padding top to prevent overlap */}
      <div className="pt-[11rem]">
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
