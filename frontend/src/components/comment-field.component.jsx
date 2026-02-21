import { useContext, useState } from "react";
import { UserContext } from "../App";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";
import { COMMENT_API } from "../common/api";

const CommentField = ({ action, replyingTo, onCommentAdded }) => {
  // Get context data
  const { blog, blogAuthor, setBlog } = useContext(BlogContext);
  const userContext = useContext(UserContext);

  // Safely extract user auth data with fallbacks
  const userAuth = userContext?.userAuth || {};
  const { access_token, username, fullname, profile_img, user_id } = userAuth;

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destructure blog data with fallbacks
  const { blog_id = "", total_comments = 0 } = blog || {};

  const handleComment = async () => {
    // Validation checks
    if (!access_token || !user_id) {
      return toast.error("Login first to leave a comment....");
    }

    if (!comment.trim().length) {
      return toast.error("Write something to leave a comment.....");
    }

    if (comment.trim().length > 1000) {
      return toast.error("Comment must be under 1000 characters");
    }

    if (!blog_id) {
      return toast.error("Invalid blog ID");
    }

    setIsSubmitting(true);

    try {
      // Prepare request data
      const requestData = {
        blog_id: blog_id.trim(),
        comment: comment.trim(),
      };

      // Add replying_to if this is a reply
      if (replyingTo) {
        requestData.replying_to = replyingTo;
      }

      console.log("Sending comment request:", requestData);

      const response = await axios.post(
        `${COMMENT_API}/add-comment`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      console.log("Server response:", response.data);

      // Check if request was successful
      if (response.data.success) {
        // Clear the comment field
        setComment("");

        // Update the blog's total comments count
        setBlog((prev) => ({
          ...prev,
          total_comments: response.data.total_comments,
        }));

        // Show success message
        const successMessage = replyingTo
          ? "Reply added successfully!"
          : "Comment added successfully!";
        toast.success(successMessage);

        // Call the callback to refresh comments if provided
        if (onCommentAdded && typeof onCommentAdded === "function") {
          setTimeout(() => {
            onCommentAdded();
          }, 500); // Small delay to ensure server has processed the comment
        }
      } else {
        toast.error(response.data.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Comment error:", err);

      // Handle different types of errors
      if (err.response?.status === 401) {
        toast.error("Please login again to continue");
      } else if (err.response?.status === 404) {
        toast.error("Blog not found");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to add comment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        {/* User info for replies */}
        {replyingTo && userAuth.profile_img && (
          <div className="flex items-center gap-3 mb-4">
            <img
              src={userAuth.profile_img}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              alt={userAuth.fullname}
            />
            <span className="text-sm text-dark-grey">
              Replying as{" "}
              <span className="font-medium text-black">
                {userAuth.fullname}
              </span>
            </span>
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              replyingTo
                ? "Write a thoughtful reply..."
                : "Share your thoughts..."
            }
            className="w-full p-4 border border-grey/30 rounded-xl resize-none h-[120px] overflow-auto focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 placeholder:text-dark-grey/70 text-sm leading-relaxed"
            disabled={isSubmitting}
            maxLength={1000}
          />

          {/* Character counter */}
          <div className="absolute bottom-3 right-3 text-xs text-dark-grey bg-white px-2 py-1 rounded">
            <span
              className={comment.length > 900 ? "text-red font-medium" : ""}
            >
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-dark-grey">
            {replyingTo
              ? "💬 Reply to comment"
              : "✨ Be respectful and constructive"}
          </div>

          <button
            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
              isSubmitting
                ? "bg-grey text-dark-grey cursor-not-allowed"
                : comment.trim().length > 0
                  ? "bg-black text-white hover:bg-black/90 shadow-md hover:shadow-lg"
                  : "bg-grey text-dark-grey cursor-not-allowed"
            }`}
            onClick={handleComment}
            disabled={isSubmitting || comment.trim().length === 0}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                Posting...
              </div>
            ) : replyingTo ? (
              "Post Reply"
            ) : (
              "Post Comment"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CommentField;
