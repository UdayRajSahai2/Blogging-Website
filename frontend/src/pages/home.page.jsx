import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog/blog-post.component";
import MinimalBlogPost from "../components/blog/nobanner-blog-post.component";
import "../index.css";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { BLOG_API } from "../common/api";
import { useContext } from "react";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
const HomePage = ({ pageState, setPageState }) => {
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const isIncomplete =
    userAuth?.access_token && !userAuth?.isOnboardingCompleted;
  // Blogs
  const [blogs, setBlog] = useState(null);
  const [trendingBlogs, setTrendingBlog] = useState(null);

  const fetchLatestBlogs = async ({ page = 1 } = {}) => {
    try {
      const { data } = await axios.post(`${BLOG_API}/latest-blogs`, { page });
      const formatted = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: `${BLOG_API}/all-latest-blogs-count`,
      });
      setBlog(formatted);
    } catch (err) {
      console.error("Latest blogs fetch error:", err);
    }
  };

  const fetchBlogsByCategory = async ({ page = 1 } = {}) => {
    try {
      const { data } = await axios.post(`${BLOG_API}/search-blogs`, {
        tag: pageState,
        page,
      });
      const formatted = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: `${BLOG_API}/search-blogs-count`,
        data_to_send: { tag: pageState },
      });
      setBlog(formatted);
    } catch (err) {
      console.error("Category blogs fetch error:", err);
    }
  };

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(`${BLOG_API}/trending-blogs`);
      setTrendingBlog(data.blogs);
    } catch (err) {
      console.error("Trending blogs fetch error:", err);
    }
  };

  // --------------------- Effects ---------------------
  // blogs when page changes
  useEffect(() => {
    if (pageState === "home") fetchLatestBlogs();
    else fetchBlogsByCategory();

    if (!trendingBlogs) fetchTrendingBlogs();
  }, [pageState]);
  const getDisplayName = () =>
    pageState === "home"
      ? "Latest Blogs"
      : pageState.charAt(0).toUpperCase() + pageState.slice(1);
  // --------------------- Render ---------------------
  return (
    <AnimationWrapper>
      {isIncomplete && (
        <div
          onClick={() => navigate("/onboarding")}
          className="w-full bg-yellow-100 border-b border-yellow-200 cursor-pointer mb-2"
        >
          <div className="text-sm text-yellow-900 py-2 font-medium text-center leading-relaxed">
            🚀 Your profile is your identity here — and it truly matters.
            <span className="font-semibold">
              {" "}
              People discover, trust, and connect with complete profiles.
            </span>
            You’re just one small step away —{" "}
            <span className="underline font-semibold">
              complete your profile
            </span>{" "}
            and unlock your full presence.
          </div>
        </div>
      )}
      {/* BLOG FEED */}
      <InPageNavigation
        routes={[getDisplayName(), "trending blogs"]}
        defaultHidden={[]}
      >
        <>
          {blogs === null ? (
            <Loader />
          ) : blogs.results.length ? (
            blogs.results.map((blog, i) => (
              <AnimationWrapper
                transition={{ duration: 1, delay: i * 0.1 }}
                key={i}
              >
                <BlogPostCard content={blog} author={blog.blogAuthor} />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataMessage message="No Blogs Published" />
          )}

          <LoadMoreDataBtn
            state={blogs}
            fetchDataFun={
              pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory
            }
          />
        </>

        <>
          {trendingBlogs === null ? (
            <Loader />
          ) : trendingBlogs.length ? (
            trendingBlogs.map((blog, i) => (
              <AnimationWrapper
                transition={{ duration: 1, delay: i * 0.1 }}
                key={i}
              >
                <MinimalBlogPost blog={blog} index={i} />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataMessage message="No Blogs Published" />
          )}
        </>
      </InPageNavigation>
    </AnimationWrapper>
  );
};

export default HomePage;
