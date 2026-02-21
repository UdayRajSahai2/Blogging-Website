import { useContext, useState } from "react";
import { UserContext } from "../App";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { COMMENT_API } from "../common/api";

const NotificationCommentField = ({
  notificationData,
  setReplying,
  refreshNotifications, // Add this prop to refresh the notifications list
}) => {
  // Get user context
  const userContext = useContext(UserContext);

  // Safely extract user auth data with fallbacks
  const userAuth = userContext?.userAuth || {};
  const { access_token, username, fullname, profile_img, user_id } = userAuth;

  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Notification Data", notificationData);

  // Safely extract notification data with proper null checks
  const blog = notificationData?.blog || {};
  const comment = notificationData?.comment || {};
  const original_comment = notificationData?.original_comment || {};

  const blog_id = blog.blog_id;
  const comment_id = comment.comment_id;
  const original_comment_id = original_comment.comment_id;

  const handleReply = async () => {
    // Validation checks
    if (!access_token || !user_id) {
      return toast.error("Login first to leave a reply....");
    }

    if (!reply.trim().length) {
      return toast.error("Write something to leave a reply.....");
    }

    if (reply.trim().length > 1000) {
      return toast.error("Reply must be under 1000 characters");
    }

    if (!blog_id) {
      return toast.error("Invalid blog ID");
    }

    // Determine which comment to reply to
    const replyingToId = original_comment_id || comment_id;
    if (!replyingToId) {
      return toast.error("Cannot determine comment to reply to");
    }

    setIsSubmitting(true);

    try {
      // Prepare request data
      const requestData = {
        blog_id: blog_id.trim(),
        comment: reply.trim(),
        replying_to: replyingToId,
      };

      console.log("Sending reply request:", requestData);

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
        // Clear the reply field
        setReply("");

        // Show success message
        toast.success("Reply added successfully!");

        // Refresh notifications to show the new reply
        if (
          refreshNotifications &&
          typeof refreshNotifications === "function"
        ) {
          await refreshNotifications();
        }

        // Close the reply field after successful submission
        setTimeout(() => {
          setReplying(false);
        }, 500);
      } else {
        toast.error(response.data.message || "Failed to add reply");
      }
    } catch (err) {
      console.error("Reply error:", err);

      // Handle different types of errors
      if (err.response?.status === 401) {
        toast.error("Please login again to continue");
      } else if (err.response?.status === 404) {
        toast.error("Blog or comment not found");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to add reply. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="bg-grey/20 p-4 rounded-lg border border-grey/30">
        <div className="space-y-4">
          {/* User info */}
          {userAuth.profile_img && (
            <div className="flex items-center gap-3">
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
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a thoughtful reply..."
              className="w-full p-3 border border-grey/30 rounded-lg resize-none h-[100px] overflow-auto focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 placeholder:text-dark-grey/70 text-sm leading-relaxed bg-white"
              disabled={isSubmitting}
              maxLength={1000}
            />

            {/* Character counter */}
            <div className="absolute bottom-2 right-2 text-xs text-dark-grey bg-white px-2 py-1 rounded">
              <span
                className={reply.length > 900 ? "text-red font-medium" : ""}
              >
                {reply.length}/1000
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-dark-grey">
              💬 Reply to notification
            </div>

            <div className="flex gap-2">
              {/* Cancel button */}
              <button
                className="px-4 py-2 rounded-full font-medium text-sm text-dark-grey hover:text-black transition-colors duration-200"
                onClick={() => setReplying(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              {/* Submit button */}
              <button
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  isSubmitting
                    ? "bg-grey text-dark-grey cursor-not-allowed"
                    : reply.trim().length > 0
                      ? "bg-black text-white hover:bg-black/90 shadow-md hover:shadow-lg"
                      : "bg-grey text-dark-grey cursor-not-allowed"
                }`}
                onClick={handleReply}
                disabled={isSubmitting || reply.trim().length === 0}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                    Posting...
                  </div>
                ) : (
                  "Post Reply"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCommentField;
