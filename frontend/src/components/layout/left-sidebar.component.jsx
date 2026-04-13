import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = ({ trendingBlogs }) => {
  return (
    <aside className="order-2 lg:order-1 w-full lg:sticky lg:top-20">
      <div className="flex flex-col gap-2 w-full">
        {/* POST BLOG */}
        <Link
          to="/editor"
          className="col-span-2 rounded-lg p-3 sm:p-4 bg-gradient-to-r from-purple to-indigo-600 shadow hover:shadow-lg transition text-white"
        >
          <div className="flex items-center justify-center gap-2">
            <i className="fi fi-rr-file-edit text-lg sm:text-2xl"></i>

            <p className="text-sm sm:text-lg font-semibold">
              Post blog
              <span className="mx-2 text-white/40">•</span>
              <span className="text-white/80 text-xs sm:text-sm">
                Share your story
              </span>
            </p>
          </div>
        </Link>

        {/* COMMUNITIES */}
        <div className="col-span-2 rounded-lg p-3 sm:p-5 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-purple/20 shadow-sm">
          <p className="text-sm sm:text-lg font-semibold text-purple mb-2 sm:mb-3">
            Top Communities
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
            {["Tech", "Foodies", "Travelers", "Sports", "Music", "Anime"].map(
              (chip) => (
                <span
                  key={chip}
                  className="px-2 py-[2px] text-[10px] sm:text-xs rounded-full bg-purple/10 text-purple font-semibold"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
          <p className="text-dark-grey text-xs sm:text-sm">
            Discover and join communities. (Coming soon)
          </p>
        </div>

        {/* Trending issues (Marquee + list) */}
        <div className="col-span-2 rounded-lg bg-amber-50 border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-amber-200/60 text-amber-900 font-semibold">
            Trending issues
          </div>
          <div className="px-4 py-3">
            <marquee
              behavior="scroll"
              direction="left"
              className="text-sm text-amber-800"
            >
              New features launching soon • Community spotlight • Event week
              highlights • Security update • Share your blogs and events
            </marquee>
          </div>
          <div className="px-4 pb-4">
            {trendingBlogs?.slice(0, 3)?.map((b, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <p className="text-sm line-clamp-2">{b.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Events grid below trending issues */}
        <div className="col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-2">
          <div className="rounded-md p-5 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow min-h-[120px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📸</span>
              <div>
                <p className="text-lg font-semibold mb-1">Event Photographs</p>
                <p className="text-white/90 text-sm">flipping 1/2/3/4/5/6</p>
              </div>
            </div>
          </div>
          <div className="rounded-md p-5 bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow min-h-[120px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-lg font-semibold mb-1">Coming up Events</p>
                <p className="text-white/90 text-sm">flipping 1/2/3/4/5/6</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
