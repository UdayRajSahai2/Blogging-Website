import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
  const {
    userAuth: { username, profile_img },
    setUserAuth,
  } = useContext(UserContext);

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };

  return (
    <AnimationWrapper className="absolute right-0 z-50" transition={{ duration: 0.2 }}>
      <div className="bg-white shadow-xl rounded-lg w-64 mt-2 border border-gray-200 overflow-hidden">
        
        {/* Compact User Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <img 
              src={profile_img} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
            />
            <div>
              <p className="font-semibold text-gray-800">@{username}</p>
              <p className="text-xs text-gray-500">Active User</p>
            </div>
          </div>
        </div>

        {/* Write Button (Mobile Only) */}
        <Link 
          to="/editor" 
          className="md:hidden block px-4 py-3 bg-green-500 text-white text-center font-medium hover:bg-green-600 transition-colors"
        >
          <i className="fi fi-rr-file-edit mr-2"></i>
          Post your blog
        </Link>

        {/* Main Navigation */}
        <div className="py-2">
          <Link 
            to={`/user/${username}`} 
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-user mr-3 text-purple-600"></i>
            My Profile
          </Link>
          
          <Link 
            to="/dashboard/blogs" 
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-document mr-3 text-purple-600"></i>
            My Blogs
          </Link>
          
          <Link 
            to="/dashboard/events" 
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-calendar mr-3 text-purple-600"></i>
            My Events
          </Link>
          
          <Link 
            to="/chats" 
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-messages mr-3 text-purple-600"></i>
            My Chats
          </Link>
          
          <Link 
            to="/settings/edit-profile" 
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
          >
            <i className="fi fi-rr-settings mr-3 text-purple-600"></i>
            Settings
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Sign Out */}
        <div className="p-4">
          <button
            onClick={signOutUser}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <i className="fi fi-rr-sign-out mr-3"></i>
            <div className="text-left">
              <p className="font-medium">Sign Out</p>
              <p className="text-xs text-gray-500">@{username}</p>
            </div>
          </button>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;