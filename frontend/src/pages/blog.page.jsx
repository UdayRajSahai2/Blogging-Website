// frontend/src/pages/blog.page.jsx
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog/blog-interaction.component";
import BlogPostCard from "../components/blog/blog-post.component";
import BlogContent from "../components/blog/blog-content.component";
import CommentsContainer from "../components/comment/comments.component";
import { BLOG_API } from "../common/api";

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
      const { data } = await axios.post(`${BLOG_API}/get-blog`, { blog_id });

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
            activity: blog.activity || {},
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
          <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-2 sm:px-6 lg:px-2 py-2 md:py-10 lg:py-2">
            {/* BLOG BANNER */}
            <div className="overflow-hidden rounded-md">
              <img
                src={banner}
                alt={title}
                className="w-full aspect-[16/9] object-fill transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* TITLE */}
            <div className="mt-2 md:mt-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {title}
              </h1>
            </div>

            {/* AUTHOR INFO */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
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
            <div className="sticky top-20 z-10 bg-white py-2">
              <BlogInteraction />
            </div>

            {/* SIMILAR BLOGS */}
            {similarBlogs?.length > 0 && (
              <div className="mt-16">
                <h2 className="text-xl md:text-2xl font-semibold mb-6">
                  Similar Blogs
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarBlogs.map((blogItem, i) => (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCard
                        content={blogItem}
                        author={blogItem.blogAuthor}
                      />
                    </AnimationWrapper>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
