import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { BLOG_API } from "../common/api";

const BlogInteraction = () => {
  const {
    blog,
    activity,
    blogAuthor,
    setBlog,
    isLikedByUser,
    setLikedByUser,
    commentsWrapper,
    setCommentsWrapper,
  } = useContext(BlogContext) || {};

  const { userAuth } = useContext(UserContext) || {};
  const { username, access_token, user_id: currentUserId } = userAuth || {};

  // ✅ Single source of truth for blog id
  const blogId = blog?.blog_id ?? null;

  // ✅ Activity fallback logic (USES `activity`)
  const total_likes = activity?.total_likes ?? blog?.total_likes ?? 0;
  const total_comments = activity?.total_comments ?? blog?.total_comments ?? 0;
  const total_reads = activity?.total_reads ?? blog?.total_reads ?? 0;

  const title = blog?.title ?? "";
  const { username: author_username = "" } = blogAuthor || {};

  /* ---------------- CHECK LIKE STATUS ---------------- */
  useEffect(() => {
    if (!access_token || !blogId) return;
    checkLikeStatus();
  }, [access_token, blogId]);

  const checkLikeStatus = async () => {
    try {
      const { data } = await axios.post(
        `${BLOG_API}/check-like`,
        { blog_id: blogId },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      setLikedByUser(data.isLiked);
    } catch (err) {
      console.error("Error checking like status:", err.response?.data);
    }
  };

  /* ---------------- HANDLE LIKE ---------------- */
  const handleLike = async () => {
    if (!access_token || !currentUserId) {
      toast.error("Please login to like this blog");
      return;
    }

    if (!blogId) {
      toast.error("Blog not loaded yet");
      return;
    }

    const newLikeStatus = !isLikedByUser;

    // Optimistic update
    setLikedByUser(newLikeStatus);
    setBlog((prev) => ({
      ...prev,
      total_likes: newLikeStatus
        ? prev.total_likes + 1
        : Math.max(0, prev.total_likes - 1),
    }));

    try {
      const { data } = await axios.post(
        `${BLOG_API}/handle-like`,
        {
          blog_id: blogId,
          isLiked: newLikeStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (data.success) {
        setBlog((prev) => ({
          ...prev,
          total_likes: data.total_likes,
        }));
        setLikedByUser(data.isLiked);
      }
    } catch (err) {
      // rollback
      setLikedByUser(!newLikeStatus);
      setBlog((prev) => ({
        ...prev,
        total_likes: newLikeStatus
          ? prev.total_likes - 1
          : prev.total_likes + 1,
      }));

      toast.error(err.response?.data?.message || "Failed to update like");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="flex justify-between items-center">
        {/* LEFT: Likes, Comments, Reads */}
        <div className="flex gap-6">
          {/* Likes */}
          <div className="flex gap-2 items-center">
            <button
              disabled={!blogId}
              onClick={handleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center
                ${isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80"}
                ${!blogId ? "opacity-50 cursor-not-allowed" : "hover:bg-blue/20"}
              `}
            >
              <i
                className={
                  "fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")
                }
              ></i>
            </button>
            <p className="text-xl text-dark-grey">{total_likes}</p>
          </div>

          {/* Comments (USES commentsWrapper) */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCommentsWrapper((prev) => !prev)}
              className={`w-10 h-10 rounded-full flex items-center justify-center
                ${commentsWrapper ? "bg-blue/20 text-blue" : "bg-grey/80"}
                hover:bg-blue/20`}
            >
              <i className="fi fi-rs-comment-dots text-xl"></i>
            </button>
            <p className="text-xl text-dark-grey">{total_comments}</p>
          </div>

          {/* Reads (USES activity) */}
          <div className="flex gap-2 items-center">
            <i className="fi fi-rr-eye text-xl text-dark-grey"></i>
            <p className="text-xl text-dark-grey">{total_reads}</p>
          </div>
        </div>

        {/* RIGHT: Edit & Twitter */}
        <div className="flex items-center gap-4">
          {username === author_username && blogId && (
            <Link
              to={`/editor/${blogId}`}
              className="flex items-center gap-1 underline hover:text-purple"
            >
              <i className="fi fi-rr-edit text-sm"></i>
              <span>Edit</span>
            </Link>
          )}

          <a
            href={`https://twitter.com/intent/tweet?text=Read ${title}&url=${window.location.href}`}
            className="flex items-center text-xl hover:text-twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fi fi-brands-twitter"></i>
          </a>
        </div>
      </div>

      {/* Visual feedback for comments state */}
      {commentsWrapper && (
        <p className="text-sm text-dark-grey mt-2">Comments are open</p>
      )}

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
