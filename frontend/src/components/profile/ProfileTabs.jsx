import DonorDashboard from "../donation/donor-dashboard.component.jsx";
import AboutUser from "./AboutUser.jsx";
import BlogPostCard from "../blog/blog-post.component.jsx";
import NoDataMessage from "../nodata.component.jsx";
import LoadMoreDataBtn from "../load-more.component.jsx";
import Loader from "../loader.component.jsx";
import AnimationWrapper from "../../common/page-animation.jsx";

/* ---------------- PROFILE TABS ---------------- */

const ProfileTabs = ({
  tab,
  setTab,
  blogs,
  getBlogs,
  isOwner,
  bio,
  createdAt,
  details,
  addresses,
  experiences,
  academics,
  interests,
}) => {
  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="sticky top-16 z-10 bg-white ">
        <div className="flex gap-6 text-sm font-medium overflow-x-auto px-1">
          {/* ABOUT */}
          <button
            onClick={() => setTab("about")}
            className={`relative flex items-center gap-2 pb-3 transition ${
              tab === "about"
                ? "text-indigo-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <i className="fi fi-rr-user text-sm"></i>
            About
            {tab === "about" && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-600"></span>
            )}
          </button>

          {/* BLOGS */}
          <button
            onClick={() => setTab("blogs")}
            className={`relative flex items-center gap-2 pb-3 transition ${
              tab === "blogs"
                ? "text-indigo-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <i className="fi fi-rr-document text-sm"></i>
            Blogs
            {tab === "blogs" && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-600"></span>
            )}
          </button>

          {/* donor */}
          {isOwner && (
            <button
              onClick={() => setTab("donor")}
              className={`relative flex items-center gap-2 pb-3 transition ${
                tab === "donor"
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <i className="fi fi-rr-hand-holding-heart text-sm"></i>
              Donor
              {tab === "donor" && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-600"></span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-1">
        {/* BLOGS TAB */}
        {tab === "blogs" && (
          <div className="space-y-4">
            {blogs === null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => (
                <AnimationWrapper
                  key={blog.blog_id || i}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <BlogPostCard content={blog} author={blog.blogAuthor} />
                </AnimationWrapper>
              ))
            ) : (
              <NoDataMessage message="No blogs yet" />
            )}

            <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
          </div>
        )}

        {/* ABOUT TAB */}
        {tab === "about" && (
          <AboutUser
            bio={bio}
            joinedAt={createdAt}
            details={details}
            addresses={addresses}
            experiences={experiences}
            academics={academics}
            interests={interests || []}
            isOwner={isOwner}
          />
        )}

        {/* Donor-Donation TAB */}
        {tab === "donor" && isOwner && <DonorDashboard />}
      </div>
    </div>
  );
};

export default ProfileTabs;
