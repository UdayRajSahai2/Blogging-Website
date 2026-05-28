import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BLOG_API } from "../../common/api";

import ChevronLeftIcon from "@heroicons/react/24/solid/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";
/* -------------------- MAIN CAROUSEL -------------------- */

const BlogCarousel = ({ pageState }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const endpoint =
          pageState === "home" ? "/latest-blogs" : "/search-blogs";

        const payload =
          pageState === "home"
            ? { page: 1, fetchAll: true }
            : { tag: pageState, page: 1, fetchAll: true };

        const res = await axios.post(BLOG_API + endpoint, payload);

        // sanitize blogs
        const cleanBlogs = (res.data.blogs || []).filter(
          (b) => b && b.blog_id && b.title && b.banner,
        );

        setBlogs(cleanBlogs);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [pageState]);

  if (loading) {
    return (
      <div className="w-full h-52 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple" />
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="w-full h-52 flex items-center justify-center">
        <p className="text-dark-grey">No blogs available</p>
      </div>
    );
  }

  // single blog layout
  if (blogs.length === 1) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <MiniCarousel blogs={blogs} />
      </div>
    );
  }

  const mid = Math.ceil(blogs.length / 2);
  const blogsA = blogs.slice(0, mid);
  const blogsB = blogs.slice(mid);

  return (
    <div className="w-full h-full py-0">
      <div
        className="grid grid-cols-[1fr_140px] md:grid-cols-[1fr_0.5fr]
                   grid-rows-2
                   gap-y-1.4
                   md:gap-y-0.5
                   gap-x-0.4
                   md:gap-x-0.5
                   h-full
                   min-w-0"
      >
        {/* LEFT BIG */}
        <div className="row-span-2 min-w-0">
          <MiniCarousel blogs={blogsA} isFirstBlog />
        </div>

        {/* TOP RIGHT */}
        <MiniCarousel blogs={blogsB.slice(0, Math.ceil(blogsB.length / 2))} />

        {/* BOTTOM RIGHT */}
        <MiniCarousel blogs={blogsB.slice(Math.ceil(blogsB.length / 2))} />
      </div>
    </div>
  );
};

export default BlogCarousel;

/* -------------------- MINI CAROUSEL -------------------- */

const MiniCarousel = ({ blogs, isFirstBlog = false }) => {
  if (!blogs?.length) return null;

  const [index, setIndex] = useState(0);
  const current = blogs[index];

  /* stable interval */
  useEffect(() => {
    if (blogs.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % blogs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [blogs]);

  const next = () => setIndex((i) => (i + 1) % blogs.length);
  const prev = () => setIndex((i) => (i - 1 + blogs.length) % blogs.length);

  /* -------- SAFE TAG PARSING -------- */
  let tag = "Blog";

  if (Array.isArray(current.tags)) {
    tag = current.tags[0] || tag;
  } else if (typeof current.tags === "string") {
    try {
      const parsed = JSON.parse(current.tags);
      tag = parsed?.[0] || tag;
    } catch {}
  }

  return (
    <div
      className={`relative overflow-hidden shadow bg-white group w-full h-full ${
        isFirstBlog ? "aspect-[16/9] md:aspect-auto md:h-full" : "aspect-[16/9]"
      }`}
    >
      {/* Tag */}
      <div
        className="absolute top-2 left-2 sm:top-3 sm:left-4 z-10 text-[10px] sm:text-xs bg-black/60 text-white px-2 py-[2px] sm:px-3 sm:py-1
                  rounded-md font-semibold
                    capitalize tracking-wide"
      >
        {tag}
      </div>

      <Link to={`/blog/${current.blog_id}`} className="block h-full relative">
        <img
          src={current.banner}
          alt={current.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/fallback-blog.jpg";
          }}
          className="w-full aspect-[16/9] object-fill transition-transform duration-700 group-hover:scale-105"
        />

        <div
          className="absolute bottom-0 left-0 right-0
                     bg-gradient-to-t from-black/80 via-black/40 to-transparent
                     text-white
                     px-3 sm:px-4
                     py-2 sm:py-3
                     text-xs sm:text-sm md:text-base
                     font-medium
                     capitalize
                     tracking-wide
                     drop-shadow-md
                     line-clamp-2"
        >
          {current.title}
        </div>
      </Link>

      {blogs.length > 1 && (
        <>
          <button
            aria-label="Previous blog"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2
                       flex items-center justify-center
                       w-8 h-8
                       bg-white/70 hover:bg-white
                       text-gray-800
                       rounded-full
                       shadow-sm
                       opacity-0 group-hover:opacity-100
                       transition"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <button
            aria-label="Next blog"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2
                          flex items-center justify-center
                          w-8 h-8
                          bg-white/70 hover:bg-white
                          text-gray-800
                          rounded-full
                          shadow-sm
                          opacity-0 group-hover:opacity-100
                          transition"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
