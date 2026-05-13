// frontend/src/pages/blog.page.jsx
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { createContext, useEffect, useState, useContext } from "react";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog/blog-interaction.component";
import BlogPostCard from "../components/blog/blog-post.component";
import BlogContent from "../components/blog/blog-content.component";
import CommentsContainer from "../components/comment/comments.component";
import { BLOG_API } from "../common/api";
import SimilarBlogCard from "../components/blog/SimilarBlogCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRef } from "react";

export const blogStructure = {
  title: "",
  des: "",
  content: { time: 0, blocks: [], version: "" },
  tags: [],
  blogAuthor: {},
  banner: "",
  publishedAt: "",
  status: "",
  is_deleted: false,
  review_note: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [comments, setComments] = useState({ results: [] });
  const { userAuth } = useContext(UserContext);
  const { access_token } = userAuth || {};

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollAmount = 240;

    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };
  // ===== SAFE BLOG PROCESS =====
  const processBlogData = (blogData) => {
    if (!blogData) {
      setLoading(false);
      return;
    }

    // Safe JSON parsing
    let parsedContent = blogStructure.content;
    let parsedTags = [];

    try {
      parsedContent =
        typeof blogData.content === "string"
          ? JSON.parse(blogData.content)
          : blogData.content;
    } catch (err) {
      console.warn("Content parse error");
    }

    try {
      parsedTags =
        typeof blogData.tags === "string"
          ? JSON.parse(blogData.tags)
          : blogData.tags;
    } catch (err) {
      console.warn("Tags parse error");
    }

    const updatedBlog = {
      ...blogData,
      content: parsedContent || blogStructure.content,
      tags: parsedTags || [],
    };

    setBlog(updatedBlog);

    // Fetch similar blogs if published
    if (updatedBlog.status === "published" && parsedTags?.length) {
      axios
        .post(`${BLOG_API}/search-blogs`, {
          tag: parsedTags[0],
          limit: 6,
          eliminate_blog: blog_id,
        })
        .then(({ data }) => setSimilarBlogs(data.blogs))
        .catch(() => {});
    }

    setLoading(false);
  };

  // ===== FETCH BLOG =====
  const fetchBlog = async () => {
    try {
      const viewedBlogs = JSON.parse(
        localStorage.getItem("viewedBlogs") || "[]",
      );

      const alreadyViewed = viewedBlogs.includes(blog_id);

      const { data } = await axios.post(
        `${BLOG_API}/get-blog`,
        {
          blog_id,
          alreadyViewed,
        },
        access_token
          ? {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          : {},
      );

      if (!alreadyViewed) {
        viewedBlogs.push(blog_id);

        localStorage.setItem("viewedBlogs", JSON.stringify(viewedBlogs));
      }

      processBlogData(data.blog);
    } catch (err) {
      // Handle moderated blogs
      if (err.response?.status === 403 && err.response?.data?.blog) {
        processBlogData(err.response.data.blog);
        return;
      }

      console.log(err);
      setLoading(false);
    }
  };

  // ===== REFRESH BLOG (after edit) =====
  const refreshBlog = () => {
    setLoading(true);
    fetchBlog();
  };

  // ===== INITIAL LOAD =====
  useEffect(() => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);

    // reset comments when blog changes
    setComments({ results: [] });
    setTotalParentCommentsLoaded(0);

    fetchBlog();
  }, [blog_id]);

  // ===== STATUS FLAGS =====
  const isPublished = blog?.status === "published";
  const isDeleted = blog?.is_deleted;
  const isRejected = blog?.status === "rejected";
  const isPending = blog?.status === "pending";

  const {
    title,
    content,
    banner,
    blogAuthor: { fullname, username: author_username, profile_img } = {},
    publishedAt,
  } = blog;

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : isDeleted ? (
        <div className="text-center py-20 text-gray-500">
          This blog has been removed.
        </div>
      ) : !isPublished ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">
            This blog is not publicly available
          </h2>

          {isPending && (
            <p className="text-blue-600 text-sm">
              This blog is under admin review.
            </p>
          )}

          {isRejected && (
            <p className="text-red-600 text-sm">
              This blog was rejected by admin.
              {blog.review_note && (
                <>
                  <br />
                  Reason: {blog.review_note}
                </>
              )}
            </p>
          )}
        </div>
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            refreshBlog, //  allows blog refresh after edit
            blogAuthor: blog.blogAuthor,
            isLikedByUser,
            setLikedByUser,
            commentsWrapper,
            setCommentsWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
            comments,
            setComments,
          }}
        >
          <CommentsContainer />

          {/* MAIN WRAPPER */}
          <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-0 sm:px-1 lg:px-1 py-0 md:py-1 lg:py-1">
            {/* BLOG BANNER */}
            <div className="overflow-hidden rounded-md">
              <img
                src={banner}
                alt={title}
                className="w-full aspect-[16/9] object-fill transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* TITLE */}
            <div className="mt-2 md:mt-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {title}
              </h1>
            </div>

            {/* AUTHOR INFO */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-3">
                <img
                  src={profile_img}
                  alt={fullname}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover"
                />

                <div className="text-sm leading-tight">
                  <p className="font-medium capitalize">{fullname}</p>

                  <Link
                    to={`/user/${author_username}`}
                    className="text-gray-500 hover:underline"
                  >
                    @{author_username}
                  </Link>
                </div>
              </div>

              <p className="text-xs md:text-sm text-gray-500">
                {getDay(publishedAt)}
              </p>
            </div>

            {/* BLOG CONTENT */}
            <article
              className="mx-auto max-w-2xl md:max-w-3xl lg:max-w-4xl
              px-1 md:px-0
              font-serif text-[17px] md:text-[19px]
              leading-8 md:leading-9
              text-gray-800
              space-y-6"
            >
              {content?.blocks?.length ? (
                content.blocks.map((block, i) => (
                  <BlogContent key={i} block={block} index={i} />
                ))
              ) : (
                <p className="text-gray-500">No content available</p>
              )}
            </article>

            {/* INTERACTION AGAIN */}
            <div className="sticky top-20 z-10 bg-white">
              <BlogInteraction />
            </div>

            {/* SIMILAR BLOGS */}
            {similarBlogs?.length > 0 && (
              <section>
                {/* Header */}
                <h4 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900 mb-2">
                  Similar Blogs
                </h4>

                {/* Slider Wrapper */}
                <div className="relative group">
                  {similarBlogs.length > 4 && (
                    <>
                      {/* Left Arrow */}
                      <button
                        onClick={() => scroll("left")}
                        className="
    hidden md:flex
    items-center justify-center

    absolute
    left-2
    top-[45px]
    z-20

    w-8 h-8
    rounded-full

    bg-white/40
    backdrop-blur-md
    border border-white/30

    text-gray-700
    shadow-md

    opacity-0
    group-hover:opacity-100

    hover:bg-white/60

    transition-all
    duration-200
  "
                      >
                        <FiChevronLeft size={16} />
                      </button>

                      {/* Right Arrow */}
                      <button
                        onClick={() => scroll("right")}
                        className="
    hidden md:flex
    items-center justify-center

    absolute
    right-2
    top-[45px]
    z-20

    w-8 h-8
    rounded-full

    bg-white/40
    backdrop-blur-md
    border border-white/30

    text-gray-700
    shadow-md

    opacity-0
    group-hover:opacity-100

    hover:bg-white/60

    transition-all
    duration-200
  "
                      >
                        <FiChevronRight size={16} />
                      </button>
                    </>
                  )}

                  {/* Slider */}
                  <div
                    ref={scrollRef}
                    className="
    flex
    gap-[6px]
    overflow-x-auto
    scroll-smooth
    scrollbar-hide
    snap-x
    snap-mandatory
    pb-1
  "
                  >
                    {similarBlogs.map((blogItem, i) => (
                      <div
                        key={blogItem.blog_id || i}
                        className="
              min-w-[220px]
              max-w-[220px]
              flex-shrink-0
            "
                      >
                        <AnimationWrapper
                          transition={{
                            duration: 0.45,
                            delay: i * 0.05,
                          }}
                        >
                          <SimilarBlogCard
                            content={blogItem}
                            author={blogItem.blogAuthor}
                          />
                        </AnimationWrapper>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
