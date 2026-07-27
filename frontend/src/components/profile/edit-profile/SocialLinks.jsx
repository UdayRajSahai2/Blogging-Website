import React from "react";

import { PhoneIcon, LinkIcon } from "@heroicons/react/24/outline";

import {
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  GithubIcon,
  WhatsappIcon,
  WebsiteIcon,
  LinkedinIcon, // Imported LinkedinIcon
} from "../../../common/icons/SocialIcons";

const SocialLinksSection = ({ profile, setProfile }) => {
  const socialKeys = [
    { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
    { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
    { key: "instagram", label: "Instagram", Icon: InstagramIcon },
    { key: "facebook", label: "Facebook", Icon: FacebookIcon },
    { key: "twitter", label: "Twitter / X", Icon: TwitterIcon },
    { key: "github", label: "GitHub", Icon: GithubIcon },
    { key: "whatsapp", label: "WhatsApp", Icon: WhatsappIcon },
    { key: "website", label: "Website", Icon: WebsiteIcon },
  ];

  const placeholders = {
    linkedin: "linkedin.com/in/username",
    youtube: "youtube.com/@channel",
    instagram: "instagram.com/username",
    facebook: "facebook.com/username",
    twitter: "x.com/username",
    github: "github.com/username",
    whatsapp: "9876543210",
    website: "yourwebsite.com",
  };

  const baseUrls = {
    linkedin: "https://linkedin.com/in/",
    youtube: "https://youtube.com/",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    twitter: "https://x.com/",
    github: "https://github.com/",
  };

  const handleChange = (key, value) => {
    let val = value;

    if (key === "whatsapp") {
      val = value.replace(/\D/g, "").slice(-10);
    }

    setProfile((prev) => ({
      ...prev,
      details: {
        ...(prev.details || {}),
        [key]: val,
      },
    }));
  };

  const handleBlur = (key, value) => {
    if (!value) return;

    let val = value.trim();

    if (key === "whatsapp") {
      val = val.replace(/\D/g, "").slice(-10);
    } else if (key === "website") {
      if (!val.startsWith("http")) {
        val = `https://${val}`;
      }
    } else {
      if (!val.startsWith("http")) {
        val = baseUrls[key] + val.replace(/^@/, "");
      }
    }

    setProfile((prev) => ({
      ...prev,
      details: {
        ...(prev.details || {}),
        [key]: val,
      },
    }));
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <LinkIcon className="w-5 h-5 text-indigo-500" />
        <p className="text-sm font-semibold text-gray-600 uppercase">
          Social Links
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {socialKeys.map(({ key, label, Icon }) => (
          <div key={key}>
            <div className="flex items-center gap-2 bg-white border rounded-full px-3 h-10 focus-within:ring-2 focus-within:ring-indigo-400">
              <Icon className="w-4 h-4 text-gray-400" />

              <input
                type={key === "whatsapp" ? "tel" : "text"}
                value={profile?.details?.[key] || ""}
                placeholder={placeholders[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={(e) => handleBlur(key, e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            {/* subtle helper text */}
            <p className="text-[10px] text-gray-400 mt-1 ml-2">
              {key === "whatsapp"
                ? "Enter 10-digit whatsapp  number"
                : key === "website"
                  ? "Enter your website (e.g. mysite.com)"
                  : "Username or profile link"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksSection;
