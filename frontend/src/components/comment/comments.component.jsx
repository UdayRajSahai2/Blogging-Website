import { useContext, useEffect, useState, useRef } from "react";
import { BlogContext } from "../../pages/blog.page";
import CommentField from "./comment-field.component";
import AnimationWrapper from "../../common/page-animation";
import CommentCard from "./comment-card.component";
import axios from "axios";
import { COMMENT_API } from "../../common/api";

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  try {
    const response = await axios.post(`${COMMENT_API}/get-blog-comments`, {
      blog_id,
      skip,
    });

    const { data } = response;

    if (data.success && data.comments) {
      const comments = data.comments;

      if (setParentCommentCountFun) {
        setParentCommentCountFun((prevVal) => prevVal + comments.length);
      }

      if (comment_array == null) {
        return {
          results: comments,
          pagination: data.pagination,
        };
      } else {
        return {
          results: [...comment_array, ...comments],
          pagination: data.pagination,
        };
      }
    } else {
      return { results: comment_array || [] };
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { results: comment_array || [] };
  }
};

const CommentsContainer = () => {
  const {
    blog: { title, blog_id },
    comments,
    setComments,
    commentsWrapper,
    setCommentsWrapper,
  } = useContext(BlogContext);

  const [isLoading, setIsLoading] = useState(false);
  const [parentCommentCount, setParentCommentCount] = useState(0);

  const drawerRef = useRef(null);
  const startY = useRef(null);

  const comment_array = comments?.results || [];

  // Lock background scroll + focus input
  useEffect(() => {
    if (commentsWrapper) {
      document.body.style.overflow = "hidden";

      const input = document.querySelector("#comment-input");
      input?.focus();
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [commentsWrapper]);

  // Load comments when drawer opens
  useEffect(() => {
    if (!blog_id || !commentsWrapper) return;

    if (comment_array.length === 0) {
      loadComments();
    }
  }, [blog_id, commentsWrapper]);

  const loadComments = async (skip = 0) => {
    if (isLoading || !blog_id) return;

    setIsLoading(true);

    try {
      const result = await fetchComments({
        skip,
        blog_id,
        setParentCommentCountFun: setParentCommentCount,
        comment_array: skip > 0 ? comment_array : null,
      });

      setComments(result);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (comment_array.length > 0) {
      loadComments(comment_array.length);
    }
  };

  const refreshComments = () => {
    setComments({ results: [] });
    setParentCommentCount(0);
    loadComments(0);
  };

  // Swipe down to close (mobile)
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!startY.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 120) {
      setCommentsWrapper(false);
      startY.current = null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setCommentsWrapper(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          commentsWrapper ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`fixed top-0 right-0 h-full w-full sm:w-[65%] lg:w-[35%]
        bg-white shadow-2xl z-50 transform transition-transform duration-500
        flex flex-col
        ${commentsWrapper ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-grey/20 p-4 sm:p-6 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-black">
                Comments
              </h1>

              <p className="text-xs sm:text-sm text-dark-grey mt-1 line-clamp-2">
                {title}
              </p>
            </div>

            <button
              onClick={() => setCommentsWrapper(false)}
              className="flex justify-center items-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-grey/50 hover:bg-grey transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Comment List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {isLoading && comment_array.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-grey border-t-black mb-4"></div>
              <p className="text-dark-grey text-sm">Loading comments...</p>
            </div>
          )}

          {comment_array.length ? (
            <div className="space-y-4">
              {comment_array.map((comment, i) => (
                <AnimationWrapper
                  key={comment.comment_id || i}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <CommentCard
                    index={i}
                    leftval={0}
                    commentData={comment}
                    onReplyAdded={refreshComments}
                    onCommentDeleted={refreshComments}
                  />
                </AnimationWrapper>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 bg-grey/20 rounded-full flex items-center justify-center mb-4">
                  💬
                </div>

                <h3 className="text-lg font-medium text-dark-grey mb-2">
                  No comments yet
                </h3>

                <p className="text-sm text-dark-grey text-center">
                  Be the first to share your thoughts!
                </p>
              </div>
            )
          )}

          {/* Load More */}
          {comments?.pagination?.hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMoreComments}
                disabled={isLoading}
                className="px-6 py-3 bg-grey hover:bg-black hover:text-white text-dark-grey rounded-full font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load More Comments"}
              </button>
            </div>
          )}
        </div>

        {/* Sticky Comment Input */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3">
            <CommentField
              id="comment-input"
              action="comment"
              onCommentAdded={refreshComments}
              placeholder="Write a comment..."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentsContainer;
