import { Link } from "react-router-dom";
import logo from "../../imgs/logo.png";
import fullLogo from "../../imgs/full-logo.png";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-700 to-slate-800 text-white mt-1">
      <div className="max-w-7xl mx-auto px-2 pt-3 pb-1">
        {/* Top */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={logo}
                className="w-8 h-8 object-contain"
                alt="REACH Foundation Logo"
              />
              <span className="text-base font-bold tracking-tight text-purple-600">
                REACH{" "}
                <span className="font-medium text-gray-400">Foundation</span>
              </span>
            </div>

            <p className="text-gray-400 text-xs mb-3 max-w-sm">
              Connect with people and share stories with the community.
            </p>

            <div className="flex gap-3 text-lg">
              <a className="text-gray-400 hover:text-white">
                <FaFacebook />
              </a>

              <a className="text-gray-400 hover:text-white">
                <FaTwitter />
              </a>

              <a className="text-gray-400 hover:text-white">
                <FaInstagram />
              </a>

              <a className="text-gray-400 hover:text-white">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/editor" className="text-gray-400 hover:text-white">
                  Write
                </Link>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white">About</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-semibold mb-2">Categories</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <a className="text-gray-400 hover:text-white">Tech</a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white">Travel</a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white">Food</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xl font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <a className="text-gray-400 hover:text-white">Help</a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white">Privacy</a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700/60 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs text-gray-400 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              className="h-5 w-auto object-contain"
              alt="REACH Foundation"
            />
            <span>© 2026 REACH Foundation</span>
          </div>

          <span className="hover:text-gray-300 transition">Made with ❤️</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
