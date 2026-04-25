import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import ConnectionButton from "../connection/ConnectionButton";
import { createConversationAPI } from "../../api/chat.api";
import {
  MapPinIcon,
  UserIcon,
  HeartIcon,
  CakeIcon,
} from "@heroicons/react/24/solid";

const ProfileHeader = ({ profile }) => {
  const navigate = useNavigate();
  const { userAuth } = useContext(UserContext);
  const [connectionStatus, setConnectionStatus] = useState(null);
  if (!profile) return null; // safety

  const {
    user_id,
    fullname,
    username,
    profile_img,
    bio,
    createdAt,
    total_posts,
    total_reads,
    profession,
    display_location, //live location display
  } = profile;
  const socialPlatforms = [
    "youtube",
    "instagram",
    "facebook",
    "twitter",
    "github",
    "website",
    "whatsapp",
  ];
  const details = profile?.details || {};
  const { salutation } = details;

  const userType = userAuth?.user_type || profile?.details?.user_type;

  const isCurrentUser = String(user_id) === String(userAuth?.user_id);

  /* =========================
     HELPERS
  ========================= */
  const getUserTypeBadge = (type) => {
    switch (type) {
      case "professional":
        return {
          label: "💼 Professional",
          className: "bg-green-100 text-green-700",
        };
      case "student":
        return {
          label: "🎓 Student",
          className: "bg-blue-100 text-blue-700",
        };
      case "retired":
        return {
          label: "🏖️ Retired",
          className: "bg-purple-100 text-purple-700",
        };
      default:
        return null;
    }
  };

  const badge = getUserTypeBadge(userType);

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  /* =========================
     META
  ========================= */

  const { gender, marital_status, dob } = useUserMeta(details);

  const metaItems = [
    display_location && {
      icon: MapPinIcon,
      value: display_location,
      color: "text-red-500",
    },
    gender && {
      icon: UserIcon,
      value: capitalizeWords(gender),
      color: "text-indigo-500",
    },
    marital_status && {
      icon: HeartIcon,
      value: capitalizeWords(marital_status),
      color: "text-pink-500",
    },
    dob && {
      icon: CakeIcon,
      value: dob,
      color: "text-orange-500",
    },
  ].filter(Boolean);

  /* =========================
     EXPERIENCE
  ========================= */

  const getLatestExperience = (experiences = []) => {
    if (!experiences.length) return null;

    const current = experiences.find((e) => e.is_current);
    if (current) return current;

    return [...experiences].sort(
      (a, b) => new Date(b.start_date) - new Date(a.start_date),
    )[0];
  };

  const latestExp = getLatestExperience(profile?.experiences || []);

  /* =========================
     EDUCATION
  ========================= */

  const getLatestEducation = (academics = []) => {
    if (!academics.length) return null;

    const primary = academics.find((e) => e.is_primary);
    if (primary) return primary;

    return [...academics].sort(
      (a, b) => (b.end_year || 0) - (a.end_year || 0),
    )[0];
  };

  const latestEdu = getLatestEducation(profile?.academics || []);

  /* =========================
     DISPLAY LOGIC
  ========================= */

  const professionDisplay = (() => {
    try {
      const role =
        latestExp?.designation ||
        latestExp?.profession?.name ||
        profession?.name ||
        "";

      const occupation = details?.occupation_status;

      // 🧑‍💼 Working
      if (occupation === "working") return role;

      // 🎓 Student
      if (occupation === "student") {
        const edu = latestEdu?.title || latestEdu?.level || "";
        return edu || "Student";
      }

      // 🏖️ Retired
      if (occupation === "retired") {
        return role ? `Former ${role}` : "";
      }

      // ✨ Not working
      if (occupation === "not_working") return "";

      return "";
    } catch (err) {
      console.error("professionDisplay error:", err);
      return "";
    }
  })();

  const truncateWords = (text, limit) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + "...";
  };

  const handleMessage = async () => {
    try {
      const res = await createConversationAPI({
        userIds: [user_id],
        isGroup: false,
      });

      navigate(`/chat/conversation/${res.data.conversation_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full border border-gray-200 shadow-lg">
      {/* BLUE BANNER */}
      <div className="h-8 bg-gradient-to-r from-pink-800 via-purple-900 to-violet-800" />

      {/* MAIN HEADER */}
      <div className="px-2 sm:px-2 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* ================= LEFT ================= */}
          <div className="flex items-start gap-2 min-w-0">
            <img
              src={profile_img || "/default-avatar.png"}
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border"
            />

            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-semibold truncate leading-tight -mt-2">
                {salutation ? `${salutation}. ` : ""}
                {fullname}
              </h2>

              <p className="text-[11px] text-gray-700 truncate">
                <span className="text-gray-500 mr-1">Username:</span>@{username}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Badge */}
                {badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}

                {/* Dot separator */}
                {badge && professionDisplay && (
                  <span className="text-gray-400">•</span>
                )}

                {/* Text */}
                {professionDisplay && (
                  <p className="text-sm text-gray-700">{professionDisplay}</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            {/* Stats */}
            <div className="flex items-center gap-3 text-[11px] text-gray-600 whitespace-nowrap">
              <span>
                <b>{total_posts}</b> Blogs
              </span>
              <span>•</span>
              <span>
                <b>{total_reads}</b> Reads
              </span>
              {createdAt && (
                <>
                  <span>•</span>
                  <span>Joined {new Date(createdAt).getFullYear()}</span>
                </>
              )}
            </div>
            {/* Social Icons */}
            {socialPlatforms.some((key) => profile.details?.[key]) && (
              <div className="flex items-center gap-2">
                {socialPlatforms.map((key) => {
                  const link = profile.details?.[key];
                  const iconClass =
                    key !== "website"
                      ? `fi fi-brands-${key}`
                      : "fi fi-rr-globe";

                  return link ? (
                    <a
                      key={key}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-600 hover:text-indigo-600 text-sm"
                    >
                      <i className={iconClass} />
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= SECOND ROW ================= */}

        <div className="flex items-center gap-2 text-[11px] mt-1 text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {metaItems.map((item, i) => {
            const Icon = item.icon;

            return (
              <span key={i} className="flex items-center gap-1">
                {i !== 0 && <span className="text-gray-400">•</span>}
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                {item.value}
              </span>
            );
          })}
        </div>
        {/* ================= BIO ================= */}
        {bio && (
          <p className="text-[12px] text-gray-600 mt-[2px] line-clamp-1">
            <span className="text-gray-400 mr-1">📝</span>
            {truncateWords(bio, 25)}
          </p>
        )}
        {/* disabled in production */}
        {/* 🔹 ACTION BUTTON */}
        {/* {userAuth?.access_token && !isCurrentUser && (
          <div className="flex justify-start sm:ml-auto">
            {connectionStatus === "connected" ? (
              <button
                onClick={handleMessage}
                className="text-[11px] px-2 py-[2px] rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Message
              </button>
            ) : (
              <ConnectionButton
                userId={user_id}
                currentUserId={userAuth?.user_id}
                onStatusChange={setConnectionStatus}
              />
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

/* ---------------- HOOK ---------------- */

export const useUserMeta = (details = {}) => {
  const { gender, marital_status, date_of_birth } = details;

  const dob = date_of_birth
    ? new Date(date_of_birth).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return {
    gender,
    marital_status,
    dob,
  };
};

export default ProfileHeader;
