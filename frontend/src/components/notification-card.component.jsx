import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useState, useContext } from "react";
import { UserContext } from "../App";
import NotificationCommentField from "./notification-comment-field.component";
import axios from "axios";
import { toast } from "react-hot-toast";
import { COMMENT_API, NOTIFICATION_API } from "../common/api";

const NotificationCard = ({
  data,
  index,
  notificationState,
  refreshNotifications,
}) => {
  let [isReplying, setReplying] = useState(false);
  let [isDeleting, setDeleting] = useState(false);
  let [isDeletingComment, setDeletingComment] = useState(false);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  let {
    _id,
    type,
    comment,
    original_comment,
    user: { fullname, username, profile_img },
    blog: { blog_id, title },
    createdAt,
    isOwnReply = false,
  } = data;

  const handleReplyClick = () => {
    setReplying((preVal) => !preVal);
  };

  const handleDeleteNotification = async () => {
    const confirmMessage = isOwnReply
      ? "Hide this notification? (Your reply will remain on the post)"
      : "Delete this notification?";

    if (!confirm(confirmMessage)) return;

    setDeleting(true);

    try {
      const response = await axios.delete(
        `${NOTIFICATION_API}/delete-notification`,
        {
          data: { notification_id: _id },
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        toast.success(
          isOwnReply ? "Notification hidden" : "Notification deleted",
        );

        const { notifications, setNotifications } = notificationState;

        if (notifications && notifications.results) {
          const updatedResults = notifications.results.filter(
            (_, i) => i !== index,
          );

          setNotifications({
            ...notifications,
            results: updatedResults,
            totalDocs: notifications.totalDocs - 1,
            deletedDocCount: (notifications.deletedDocCount || 0) + 1,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete notification",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (
      !confirm(
        "Delete this reply permanently? This will remove it from the post and all notifications.",
      )
    ) {
      return;
    }

    setDeletingComment(true);

    try {
      const response = await axios.delete(`${COMMENT_API}/delete-comment`, {
        data: { comment_id: comment?.comment_id },
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success("Reply deleted successfully");

        // Remove from notifications list
        const { notifications, setNotifications } = notificationState;

        if (notifications && notifications.results) {
          const updatedResults = notifications.results.filter(
            (_, i) => i !== index,
          );

          setNotifications({
            ...notifications,
            results: updatedResults,
            totalDocs: notifications.totalDocs - 1,
            deletedDocCount: (notifications.deletedDocCount || 0) + 1,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.response?.data?.message || "Failed to delete reply");
    } finally {
      setDeletingComment(false);
    }
  };

  return (
    <div
      className={`p-6 border-b border-grey transition-all duration-200 ${
        isOwnReply
          ? "bg-grey/5 border-l-4 border-l-purple/30"
          : "border-l-4 border-l-black"
      }`}
    >
      <div className="flex gap-5 mb-3">
        <img
          src={profile_img}
          className="w-14 h-14 flex-none rounded-full"
          alt={fullname}
        />
        <div className="w-full">
          <h1
            className={`font-medium text-xl ${isOwnReply ? "text-dark-grey/90" : "text-dark-grey"}`}
          >
            {isOwnReply && (
              <span className="inline-block px-3 py-1 text-xs bg-purple/10 text-purple rounded-full mr-2 font-medium">
                Your reply
              </span>
            )}
            <span className="lg:inline-block hidden capitalize">
              {fullname}
            </span>
            <Link
              to={`/user/${username}`}
              className={`mx-1 underline ${isOwnReply ? "text-purple" : "text-black"}`}
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type === "like"
                ? "liked your blog"
                : type === "comment"
                  ? "commented on"
                  : isOwnReply
                    ? "your reply on"
                    : "replied on"}
            </span>
          </h1>
          {type === "reply" ? (
            <div
              className={`p-4 mt-4 rounded-md ${isOwnReply ? "bg-purple/5 border border-purple/20" : "bg-grey"}`}
            >
              <p className="text-sm text-dark-grey mb-2 font-medium">
                Original comment:
              </p>
              <p className="text-dark-grey/80">
                {original_comment
                  ? original_comment.comment
                  : "Original comment not found"}
              </p>
            </div>
          ) : (
            <Link
              to={`/blog/${blog_id}`}
              className={`font-medium hover:underline line-clamp-1 ${isOwnReply ? "text-purple" : "text-dark-grey"}`}
            >
              {`"${title}"`}
            </Link>
          )}
        </div>
      </div>
      {type !== "like" ? (
        <div
          className={`ml-14 pl-5 font-gelasio text-xl my-5 ${
            isOwnReply
              ? "border-l-2 border-purple/30 bg-purple/5 p-4 rounded-r-md"
              : ""
          }`}
        >
          {isOwnReply && (
            <div className="text-sm text-purple font-medium mb-2 not-italic">
              Your reply:
            </div>
          )}
          <p className={isOwnReply ? "text-dark-grey/90" : "text-dark-grey"}>
            {comment.comment}
          </p>
        </div>
      ) : (
        ""
      )}
      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8 items-center">
        <p>{getDay(createdAt)}</p>
        {type !== "like" ? (
          <>
            {/* Reply button - only for others' notifications */}
            {!isOwnReply && (
              <button
                className="underline hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleReplyClick}
                disabled={isDeleting || isDeletingComment}
              >
                {isReplying ? "Cancel Reply" : "Reply"}
              </button>
            )}

            {/* Delete options based on ownership */}
            {isOwnReply ? (
              // Own reply - show both delete reply and hide notification options
              <div className="flex gap-6">
                <button
                  className="underline hover:text-red disabled:opacity-50 disabled:cursor-not-allowed text-red transition-colors"
                  onClick={handleDeleteComment}
                  disabled={isDeleting || isDeletingComment}
                  title="Permanently delete your reply"
                >
                  {isDeletingComment ? "Deleting Reply..." : "Delete Reply"}
                </button>
                <button
                  className="underline hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleDeleteNotification}
                  disabled={isDeleting || isDeletingComment}
                  title="Hide this notification (keep the reply)"
                >
                  {isDeleting ? "Hiding..." : "Hide Notification"}
                </button>
              </div>
            ) : (
              // Others' notification - just delete notification
              <button
                className="underline hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleDeleteNotification}
                disabled={isDeleting || isDeletingComment}
                title="Remove this notification"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </>
        ) : (
          // Like notification - delete option
          <button
            className="underline hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleDeleteNotification}
            disabled={isDeleting || isDeletingComment}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
      {isReplying ? (
        <div className="mt-8 ml-14 pl-5">
          <NotificationCommentField
            notificationData={data}
            setReplying={setReplying}
            refreshNotifications={refreshNotifications}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
