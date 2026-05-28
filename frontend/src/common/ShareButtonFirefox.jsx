// frontend/src/common/ShareButtonFirefox.jsx

import {
  FacebookIcon,
  LinkedinIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from "../common/icons/SocialIcons";

import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export default function ShareButton({ show, shareLinks, copyLink }) {
  if (!show) return null;

  return (
    <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100"
      >
        <WhatsappIcon className="h-4 w-4 text-green-500" />
        WhatsApp
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100"
      >
        <TwitterIcon className="h-4 w-4" />
        Twitter / X
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100"
      >
        <LinkedinIcon className="h-4 w-4 text-blue-600" />
        LinkedIn
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100"
      >
        <FacebookIcon className="h-4 w-4 text-blue-500" />
        Facebook
      </a>

      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100"
      >
        <TelegramIcon className="h-4 w-4 text-sky-500" />
        Telegram
      </a>

      <button
        onClick={copyLink}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100"
      >
        <ClipboardDocumentIcon className="h-4 w-4" />
        Copy Link
      </button>
    </div>
  );
}
