import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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

        const res = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + endpoint,
          payload
        );

        setBlogs(res.data.blogs || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [pageState]);

  const mid = Math.ceil(blogs.length / 2);
  const blogsA = blogs.slice(0, mid);
  const blogsB = blogs.slice(mid);

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

// ✅ NEW: If only 1 blog, show single carousel
if (blogs.length === 1) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-2">
      <MiniCarousel blogs={blogs} />
    </div>
  );
}


  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniCarousel blogs={blogsA} isFirstBlog={true} />
        <div className="space-y-3">
          <MiniCarousel blogs={blogsB.slice(0, Math.ceil(blogsB.length / 2))} />
          <div className="border-t-2 border-grey/50 mx-2"></div>
          <MiniCarousel blogs={blogsB.slice(Math.ceil(blogsB.length / 2))} />
        </div>
      </div>
    </div>
  );
};

export default BlogCarousel;

const MiniCarousel = ({ blogs, isFirstBlog = false }) => {
  const [index, setIndex] = useState(0);
  const current = blogs[index] || {};
  const author = current.blogAuthor || {};

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % blogs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [blogs.length]);

  const next = () => setIndex((i) => (i + 1) % blogs.length);
  const prev = () => setIndex((i) => (i - 1 + blogs.length) % blogs.length);

  // Parse tag safely
  let tag = "Blog";
  try {
    const parsed =
      typeof current.tags === "string"
        ? JSON.parse(current.tags.replace(/'/g, '"'))
        : current.tags;
    tag = parsed?.[0] || tag;
  } catch {
    tag = current.tags || tag;
  }

  return (
    <div className={`relative rounded-lg overflow-hidden shadow bg-white group ${isFirstBlog ? 'h-[286px]' : 'h-[120px]'}`}>
      {/* Tag Badge */}
      <div className="absolute top-3 left-4 z-10 text-xs bg-purple text-white px-3 py-1 rounded-full font-semibold">
        {tag}
      </div>

      <Link to={`/blog/${current.blog_id}`} className="block h-full">
        <img
          src={current.banner}
          alt={current.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-3 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium line-clamp-2">
          {current.title}
        </div>
      </Link>

      {/* Arrows */}
      {blogs.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
          >
            <i className="fi fi-rr-angle-left" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
          >
            <i className="fi fi-rr-angle-right" />
          </button>
        </>
      )}
    </div>
  );
};