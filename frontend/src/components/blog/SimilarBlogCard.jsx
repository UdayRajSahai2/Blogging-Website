import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { getDay } from "../../common/date";
import { useMemo } from "react";

const SimilarBlogCard = ({ content, author, openProfile }) => {
  const {
    publishedAt,
    title,
    des,
    banner,
    total_likes,
    blog_id: id,
    tags,
  } = content || {};

  const { fullname, profile_img, username, details } = author || {};
  const salutation = details?.salutation || "";

  // Safe tag parsing
  const parsedTags = useMemo(() => {
    if (!tags) return [];

    if (Array.isArray(tags)) return tags;

    if (typeof tags === "string") {
      try {
        return JSON.parse(tags.replace(/'/g, '"'));
      } catch {
        return [tags];
      }
    }

    return [];
  }, [tags]);

  return (
    <Link
      to={`/blog/${id}`}
      className="
        group
        flex
        flex-row
        sm:flex-col
        h-full
        bg-white
        border
        border-gray-200
        rounded-sm
        overflow-hidden
        hover:shadow-md
        transition-all
        duration-300
      "
    >
      {/* Banner */}
      <div
        className="
          relative
          w-32
          h-28
          sm:w-full
          sm:h-24
          flex-shrink-0
          overflow-hidden
          bg-gray-100
        "
      >
        <img
          src={banner}
          alt={title}
          loading="lazy"
          className="
                w-full
                h-full
                object-cover
                object-top
                transition-transform
                duration-700
                group-hover:scale-105
                "
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-1 sm:p-1 min-w-0">
        {/* Meta */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 min-w-0 whitespace-nowrap overflow-hidden">
          {/* Avatar */}
          <img
            src={profile_img || "/default-avatar.png"}
            alt={fullname}
            className="
              w-4
              h-4
              sm:w-5
              sm:h-5
              rounded-full
              object-cover
              ring-1
              ring-gray-200
              shrink-0
            "
          />

          {/* Author */}
          <button
            onClick={(e) => {
              e.preventDefault();
              openProfile?.(username);
            }}
            className="
              font-medium
              text-gray-800
              truncate
              hover:underline
              max-w-[70px]
              sm:max-w-[120px]
              shrink
            "
          >
            {salutation ? `${salutation}. ` : ""}
            {fullname || "Unknown"}
          </button>

          {/* Username */}
          <span className="text-gray-400 truncate shrink">@{username}</span>

          {/* Date */}
          <span className="text-gray-400 shrink-0">
            • {publishedAt ? getDay(publishedAt) : ""}
          </span>

          {/* Likes */}
          <span className="ml-auto flex items-center gap-0.5 text-gray-600 shrink-0">
            <FiHeart size={12} />
            {total_likes || 0}
          </span>
        </div>

        {/* Title */}
        <h4
          className="
            font-semibold
            text-[14px]
            leading-snug
            line-clamp-2
            text-gray-900
          "
        >
          {title}
        </h4>

        {/* Description */}
        {des && (
          <p
            className="
              text-xs
              sm:text-sm
              text-gray-600
              leading-relaxed
              line-clamp-2
            "
          >
            {des}
          </p>
        )}

        {/* Tags */}
        {parsedTags?.length > 0 && (
          <div className=" flex flex-wrap gap-1">
            {parsedTags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="
                  inline-flex
                  items-center
                  text-[10px]
                  sm:text-[11px]
                  px-0.5
                  py-0.5
                  rounded-md
                  bg-purple-50
                  text-purple-600
                  font-medium
                "
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default SimilarBlogCard;
