// frontend\src\common\ShareButtonFirefox.jsx

import {
  FaWhatsapp,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaTelegram,
} from "react-icons/fa";

import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export default function ShareButton({ show, shareLinks, copyLink }) {
  if (!show) return null;

  return (
    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-xl p-1 z-50">
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
      >
        <FaWhatsapp className="text-green-500 text-lg" />
        WhatsApp
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
      >
        <FaTwitter className="text-lg" />
        Twitter / X
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
      >
        <FaLinkedin className="text-lg text-blue-600" />
        LinkedIn
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
      >
        <FaFacebook className="text-lg text-blue-500" />
        Facebook
      </a>

      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
      >
        <FaTelegram className="text-lg text-sky-500" />
        Telegram
      </a>

      <button
        onClick={copyLink}
        className="w-full flex items-center gap-3 text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
      >
        <ClipboardDocumentIcon className="w-4 h-4" />
        Copy Link
      </button>
    </div>
  );
}
