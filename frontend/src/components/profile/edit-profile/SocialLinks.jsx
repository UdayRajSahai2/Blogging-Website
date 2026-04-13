import React from "react";
import { LinkIcon } from "@heroicons/react/24/outline";

const SocialLinksSection = ({ profile, setProfile }) => {
  const socialKeys = [
    { key: "youtube", icon: "fi-brands-youtube" },
    { key: "instagram", icon: "fi-brands-instagram" },
    { key: "facebook", icon: "fi-brands-facebook" },
    { key: "twitter", icon: "fi-brands-twitter" },
    { key: "github", icon: "fi-brands-github" },
    { key: "whatsapp", icon: "fi-brands-whatsapp" },
    { key: "website", icon: "fi-rr-globe" },
  ];

  const handleChange = (key, value) => {
    let newValue = value;

    // ✅ WhatsApp: allow only digits (max 10)
    if (key === "whatsapp") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // ✅ Convert empty string → undefined (IMPORTANT)
    if (newValue === "") {
      newValue = undefined;
    }

    setProfile((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: newValue,
      },
    }));
  };

  const handleBlur = (key, value) => {
    //  Auto-add https:// for URLs
    const urlFields = [
      "youtube",
      "instagram",
      "facebook",
      "twitter",
      "github",
      "website",
    ];

    if (value && urlFields.includes(key)) {
      let formatted = value;

      if (!formatted.startsWith("http")) {
        formatted = `https://${formatted}`;
      }

      setProfile((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [key]: formatted,
        },
      }));
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon className="w-4 h-4 text-indigo-500" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Social Links
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {socialKeys.map(({ key, icon }) => (
          <div
            key={key}
            className="group flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 h-9 shadow-sm hover:shadow transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100"
          >
            {/* ICON */}
            <i
              className={`${icon} text-gray-400 text-sm group-focus-within:text-indigo-500 transition`}
            />

            {/* INPUT */}
            <input
              type={key === "whatsapp" ? "tel" : "text"}
              value={profile.details?.[key] || ""}
              placeholder={
                key === "whatsapp"
                  ? "9876543210"
                  : key === "website"
                    ? "yourwebsite.com"
                    : "@username"
              }
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={(e) => handleBlur(key, e.target.value)}
              className="w-24 sm:w-28 bg-transparent outline-none text-[13px] placeholder:text-gray-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksSection;
