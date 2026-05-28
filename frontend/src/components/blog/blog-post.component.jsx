import { useMemo } from "react";
import { getDay } from "../../common/date";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";

const BlogPostCard = ({ content, author, openProfile }) => {
  const {
    publishedAt,
    tags: tagsString,
    title,
    des,
    banner,
    total_likes,
    blog_id: id,
  } = content || {};

  const { fullname, profile_img, username, details } = author || {};
  const salutation = details?.salutation || "";

  //  Safe + optimized tag parsing
  const tags = useMemo(() => {
    if (!tagsString) return [];

    if (Array.isArray(tagsString)) return tagsString;

    if (typeof tagsString === "string") {
      try {
        return JSON.parse(tagsString.replace(/'/g, '"'));
      } catch {
        return [tagsString];
      }
    }

    return [];
  }, [tagsString]);

  return (
    <Link
      to={`/blog/${id}`}
      className="flex border-b border-grey items-stretch py-1 md:py-4 hover:bg-gray-50 transition"
    >
      {/* Image */}
      <div className="w-32 sm:w-40 md:w-48 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 shadow-sm aspect-video">
        <img
          src={banner}
          alt={title}
          loading="lazy"
          className="w-full aspect-[16/9] object-fill transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 px-3 py-1 gap-1">
        {/* Meta Row */}
        <div className="flex items-center text-xs text-gray-500 gap-1 sm:gap-2">
          {/* Avatar */}
          <img
            src={profile_img || "/default-avatar.png"}
            alt={fullname}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-gray-200"
          />

          {/* Author */}
          <button
            onClick={(e) => {
              e.preventDefault();
              openProfile?.(username); //  safe call
            }}
            className="font-medium text-gray-800 truncate hover:underline"
          >
            {salutation ? `${salutation}. ` : ""}
            {fullname || "Unknown"}
          </button>

          {/* Username */}
          <span className="hidden sm:inline text-gray-400">@{username}</span>

          {/* Separator */}
          <span className="text-gray-300">•</span>

          {/* Date */}
          <span className="text-gray-500 whitespace-nowrap">
            {publishedAt ? getDay(publishedAt) : ""}
          </span>

          {/* Likes */}
          <span className="ml-auto flex items-center gap-1 text-gray-600 shrink-0">
            <HeartIcon className="h-4 w-4" />
            {total_likes || 0}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 text-gray-900">
          {title}
        </h4>

        {/* Description */}
        {des && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{des}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag, index) => (
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
                          leading-none
                       "
              >
                #{String(tag).replace(/^#/, "")}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BlogPostCard;
