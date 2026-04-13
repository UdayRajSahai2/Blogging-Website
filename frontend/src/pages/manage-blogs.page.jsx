// frontend/src/pages/manage-blogs.page.jsx

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { BLOG_API } from "../common/api";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  PencilSquareIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
const MyBlogs = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // FETCH BLOGS
  useEffect(() => {
    if (!access_token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${BLOG_API}/user-blogs`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(({ data }) => {
        setBlogs(data.blogs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.response?.status, err.response?.data);
        setLoading(false);
      });
  }, [access_token]);

  // STATUS BADGE

  const STATUS_CONFIG = {
    draft: {
      text: "Draft",
      icon: PencilIcon,
      className: "bg-yellow-100 text-yellow-700",
    },
    pending: {
      text: "Under Review",
      icon: ClockIcon,
      className: "bg-blue-100 text-blue-700",
    },
    published: {
      text: "Published",
      icon: CheckCircleIcon,
      className: "bg-green-100 text-green-700",
    },
    rejected: {
      text: "Rejected",
      icon: XCircleIcon,
      className: "bg-red-100 text-red-700",
    },
  };

  const getStatusBadge = (blog) => {
    if (blog.is_deleted) {
      return {
        text: "Deleted",
        icon: XCircleIcon,
        className: "bg-gray-200 text-gray-700",
      };
    }

    return (
      STATUS_CONFIG[blog.status] || {
        text: "Unknown",
        icon: XCircleIcon,
        className: "bg-gray-100 text-gray-600",
      }
    );
  };

  // FILTER + SEARCH
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter === "all" ? true : blog.status === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading) return <Loader />;

  return (
    <AnimationWrapper>
      <section className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-1 pb-24 border-t border-r  border-gray-200 overscroll-y-contain touch-pan-y">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">My Blogs</h1>

          <div className="relative w-32 sm:w-48 md:w-64 mr-3 sm:mr-4 mt-2 sm:mt-1">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-md pl-7 pr-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 lg:mb-2 overflow-x-auto whitespace-nowrap sticky top-0 bg-white py-2 z-10">
          {["all", "published", "draft", "pending", "rejected"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 text-sm rounded-full border transition shrink-0
      ${
        filter === item ? "bg-black text-white" : "bg-white hover:bg-gray-100"
      }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {/* EMPTY */}
        {!filteredBlogs.length ? (
          <p className="text-gray-500 text-sm">No blogs found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:gap-3">
            {filteredBlogs.map((blog) => {
              const badge = getStatusBadge(blog);
              const Icon = badge.icon;

              return (
                <div
                  key={blog.blog_id}
                  className="flex gap-3 bg-white border-b p-1 sm:p-3 hover:shadow-sm transition"
                >
                  {/* IMAGE */}
                  <div className="w-20 h-20 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden rounded-sm">
                    <img
                      src={blog.banner}
                      alt="blog banner"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* CONTENT */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {/* TITLE */}
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-semibold leading-snug tracking-tight truncate break-words">
                        {blog.title}
                      </h4>

                      <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2">
                        {blog.des}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-1 mt-1 flex-wrap sm:flex-nowrap">
                      {/* STATUS BADGE */}
                      <span
                        className={`flex items-center gap-1 text-[12px] sm:text-xs px-1.5 py-0.5 rounded-full ${badge.className}`}
                      >
                        {Icon && <Icon className="w-3 h-3" />}
                        {badge.text}
                      </span>

                      {/* EDIT */}
                      <Link
                        to={`/editor/${blog.blog_id}`}
                        className="flex items-center gap-1 text-[12px] sm:text-xs px-1.5 sm:px-2 py-0.5 border rounded-md hover:bg-gray-100 transition"
                      >
                        <PencilSquareIcon className="w-3 h-3" />
                        Edit
                      </Link>

                      {/* VIEW */}
                      {blog.status === "published" && !blog.is_deleted && (
                        <Link
                          to={`/blog/${blog.blog_id}`}
                          className="flex items-center gap-1 text-[12px] sm:text-xs  px-1.5 sm:px-2 py-0.5 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition"
                        >
                          <EyeIcon className="w-3 h-3" />
                          View
                        </Link>
                      )}

                      {/* REVIEW MESSAGE */}
                      {blog.status === "rejected" && blog.review_note && (
                        <span className="text-[10px] text-red-600 truncate max-w-[120px]">
                          {blog.review_note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AnimationWrapper>
  );
};

export default MyBlogs;
