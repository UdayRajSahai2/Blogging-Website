import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { getUserMeta } from "../../utils/userMeta";
import ConnectionButton from "../connection/ConnectionButton";
import ShareButton from "../../common/ShareButtonFirefox";
import { createConversationAPI } from "../../api/chat.api";
import UserAvatar from "../../common/UserAvatar";
import MapPinIcon from "@heroicons/react/24/solid/MapPinIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import HeartIcon from "@heroicons/react/24/solid/HeartIcon";
import CakeIcon from "@heroicons/react/24/solid/CakeIcon";
import ShareIcon from "@heroicons/react/24/solid/ShareIcon";
import BriefcaseIcon from "@heroicons/react/24/solid/BriefcaseIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";
import SparklesIcon from "@heroicons/react/24/solid/SparklesIcon";

import ClipboardDocumentIcon from "@heroicons/react/24/outline/ClipboardDocumentIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import toast from "react-hot-toast";
import {
  YoutubeIcon,
  InstagramIcon,
  LinkedinIcon,
  FacebookIcon,
  TelegramIcon,
  TwitterIcon,
  GithubIcon,
  WhatsappIcon,
  WebsiteIcon,
} from "../../common/icons/SocialIcons";

const ProfileHeader = ({ profile }) => {
  const navigate = useNavigate();
  const { userAuth } = useContext(UserContext);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const profileUrl = `${window.location.origin}/user/${profile.username}`;
  const [showShareButton, setShowShareButton] = useState(false);
  const shareButtonRef = useRef(null);
  const encodedUrl = encodeURIComponent(profileUrl);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}`,
  };
  const socialIcons = {
    youtube: YoutubeIcon,
    instagram: InstagramIcon,
    linkedin: LinkedinIcon,
    facebook: FacebookIcon,
    telegram: TelegramIcon,
    twitter: TwitterIcon,
    github: GithubIcon,
    website: WebsiteIcon,
    whatsapp: WhatsappIcon,
  };
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
          label: "Professional",
          icon: BriefcaseIcon,
          className: "bg-emerald-100 text-emerald-700",
        };

      case "student":
        return {
          label: "Student",
          icon: AcademicCapIcon,
          className: "bg-sky-100 text-sky-700",
        };

      case "retired":
        return {
          label: "Retired",
          icon: SparklesIcon,
          className: "bg-zinc-100 text-zinc-700",
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

  const { gender, marital_status, dob } = getUserMeta(details);

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

      //  Working
      if (occupation === "working") return role;

      // Student
      if (occupation === "student") {
        const edu = latestEdu?.title || latestEdu?.level || "";
        return edu || "Student";
      }

      //  Retired
      if (occupation === "retired") {
        return role ? `Former ${role}` : "";
      }

      //  Not working
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);

      toast.success("Profile link copied");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.fullname}'s Profile`,
      text: profile.bio || "Check out this profile",
      url: profileUrl,
    };

    // MOBILE NATIVE SHARE
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {}
    }

    // DESKTOP FALLBACK
    setShowShareButton((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareButtonRef.current &&
        !shareButtonRef.current.contains(event.target)
      ) {
        setShowShareButton(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="w-full border border-gray-200 shadow-lg">
      {/* BLUE BANNER */}
      <div className="h-8 bg-gradient-to-r from-pink-800 via-purple-900 to-violet-800" />

      {/* MAIN HEADER */}
      <div className="px-2 sm:px-2 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* ================= LEFT ================= */}
          <div className="flex items-start gap-2 min-w-0">
            <UserAvatar
              src={profile_img}
              name={fullname}
              className="w-20 h-20 md:w-24 md:h-24"
              roundedClassName="rounded-xl"
              textClassName="text-5xl font-bold tracking-tight"
            />

            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-semibold truncate leading-tight -mt-2">
                {salutation ? `${salutation}. ` : ""}
                {fullname}
              </h2>

              <p className="text-[11px] text-gray-700 truncate">
                <span className="text-gray-500 mr-1">Username:</span>@{username}
              </p>

              <div className="flex items-center gap-1 flex-wrap">
                {/* Badge */}
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                  >
                    <badge.icon className="w-3 h-3 !text-gray-700 flex-shrink-0" />
                    <span className="text-gray-700">{badge.label}</span>
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
            <div className="flex items-center gap-1 text-[11px] text-gray-600 whitespace-nowrap">
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
              <div className="flex items-center gap-1">
                {socialPlatforms.map((key) => {
                  let link = profile.details?.[key];

                  if (key === "whatsapp" && link) {
                    link = `https://wa.me/91${link}`;
                  }

                  const Icon = socialIcons[key];

                  return link ? (
                    <a
                      key={key}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-600 hover:text-indigo-600"
                    >
                      <Icon className="h-3 w-3" />
                    </a>
                  ) : null;
                })}
              </div>
            )}
            <div ref={shareButtonRef} className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-indigo-600 hover:text-gray-600 rounded-md border text-[10px] leading-none hover:bg-gray-100 transition"
              >
                <ShareIcon className="w-3 h-3" />
                Share
              </button>

              <ShareButton
                show={showShareButton}
                shareLinks={shareLinks}
                copyLink={copyLink}
              />
            </div>
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
          <p className="flex items-center min-w-0 text-[12px] text-gray-600 mt-[2px]">
            <DocumentTextIcon className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />

            <span className="line-clamp-1">{bio}</span>
          </p>
        )}

        {/* disabled in production */}
        {/*  ACTION BUTTON */}
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

export default ProfileHeader;
