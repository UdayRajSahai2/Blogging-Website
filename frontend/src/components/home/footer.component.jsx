import { Link } from "react-router-dom";
import logo from "../../imgs/logo.png";
import ReactCountryFlag from "react-country-flag";
import { HeartIcon } from "@heroicons/react/24/solid";
import { Copyright } from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  WhatsappIcon,
} from "../../common/icons/SocialIcons";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-700 to-slate-800 text-white mt-1">
      <div className="max-w-7xl mx-auto px-3 py-3">
        {/* Main */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 items-start">
          {/* Brand */}
          <div className="col-span-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={logo}
                className="w-7 h-7 object-contain"
                alt="REACH Foundation Logo"
              />

              <span className="text-sm font-bold tracking-tight text-purple-400">
                REACH{" "}
                <span className="font-medium text-gray-300">Foundation</span>
              </span>
            </div>

            <p className="text-gray-400 text-[12px] leading-relaxed">
              Connect with people and share stories with the community.
            </p>

            <div className=" flex flex-wrap items-center gap-1">
              <a className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-[#1877F2]">
                <FacebookIcon className="h-3 w-3" />
              </a>

              <a className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-white">
                <TwitterIcon className="h-3 w-3" />
              </a>

              <a className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-[#E4405F]">
                <InstagramIcon className="h-3 w-3" />
              </a>

              <a className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-[#FF0000]">
                <YoutubeIcon className="h-3 w-3" />
              </a>

              <a className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-[#25D366]">
                <WhatsappIcon className="h-3 w-3" />
              </a>
              <a className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:text-[#0A66C2]">
                <LinkedinIcon className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5">Quick Links</h4>

            <ul className="space-y-1 text-[12px] text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/editor" className="hover:text-white transition">
                  Write
                </Link>
              </li>

              <li>
                <a className="hover:text-white transition">About</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5">Categories</h4>

            <ul className="space-y-1 text-[12px] text-gray-400">
              <li>
                <a className="hover:text-white transition">Tech</a>
              </li>

              <li>
                <a className="hover:text-white transition">Travel</a>
              </li>

              <li>
                <a className="hover:text-white transition">Food</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5">Support</h4>

            <ul className="space-y-1 text-[12px] text-gray-400">
              <li>
                <a className="hover:text-white transition">Help</a>
              </li>

              <li>
                <a className="hover:text-white transition">Privacy</a>
              </li>

              <li>
                <a className="hover:text-white transition">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700/60 mt-3 pt-2 flex flex-row flex-wrap items-center justify-between gap-1 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <img
              src={logo}
              className="h-4 w-auto object-contain"
              alt="REACH Foundation"
            />

            <div className="flex items-center gap-1 text-gray-400">
              <Copyright size={14} />

              <span className="text-[11px]">2026 REACH Foundation</span>
            </div>
          </div>

          <span className="flex items-center gap-1 hover:text-gray-300 transition whitespace-nowrap">
            Made with
            <HeartIcon className="w-3 h-3 text-red-400" />
            in
            <ReactCountryFlag
              countryCode="IN"
              svg
              style={{
                width: "1.5em",
                height: "1em",
              }}
              title="India"
            />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
