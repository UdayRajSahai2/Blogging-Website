import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { getDay } from "../../common/date";
import { useMemo } from "react";
const SimilarBlogCard = ({ content, author, openProfile }) => {
  // Blog data
  const {
    publishedAt,
    title,
    des,
    banner,
    total_likes,
    blog_id: id,
    tags,
  } = content || {};

  // Author data

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
        flex-shrink-0
        w-[180px]
      "
    >
      {/* ------------------------------------------------ */}
      {/* Blog Banner */}
      {/* ------------------------------------------------ */}
      <div className="rounded-sm overflow-hidden bg-gray-100">
        <img
          src={banner}
          alt={title}
          loading="lazy"
          className="
            w-full
            h-[105px]
            object-cover
          "
        />
      </div>
      {/* ------------------------------------------------ */}
      {/* User  Meta */}
      {/* ------------------------------------------------ */}
      <div
        className="
            flex
            items-center
            justify-between
            mt-1
            gap-2
            text-[10px]
            text-gray-500
          "
      >
        {/* Author + Date */}
        <div className="flex items-center gap-1 min-w-0">
          {/* Author Avatar */}
          <img
            src={profile_img || "/default-avatar.png"}
            alt={fullname}
            className="
                w-4
                h-4
                rounded-full
                object-cover
                flex-shrink-0
              "
          />
          {/* Author Name */}
          <span
            className="
                           truncate
                           min-w-0
                           block
                           text-gray-600
                             "
          >
            {salutation ? `${salutation}. ` : ""}
            {fullname}
          </span>
          {/* Published Date */}
          <span className="text-gray-600 shrink-0">
            • {publishedAt ? getDay(publishedAt) : ""}
          </span>
        </div>

        {/* Likes Count */}
        <div className="flex items-center gap-0.5 shrink-0">
          <FiHeart size={9} />
          {total_likes || 0}
        </div>
      </div>
      {/* ------------------------------------------------ */}
      {/* Card Content */}
      {/* ------------------------------------------------ */}
      <div>
        {/* Blog Title */}
        <h4
          className="
            text-[14px]
            font-medium
            text-gray-900
            overflow-hidden
            text-ellipsis
            whitespace-nowrap
          "
        >
          {title}
        </h4>

        {/* Short Description */}
        {des && (
          <p
            className="
              text-[11px]
              text-gray-600
              line-clamp-1
            "
          >
            {des}
          </p>
        )}
        {/* Tags */}
        {parsedTags?.length > 0 && (
          <div className="flex flex-wrap items-center mt-0.5">
            {parsedTags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="
          inline-flex
          items-center
          whitespace-nowrap

          text-[10px]
          px-[1px]
          py-[1px]

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
