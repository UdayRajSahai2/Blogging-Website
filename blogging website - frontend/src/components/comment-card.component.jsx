import { useContext, useState } from "react";
import { UserContext } from "../App";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import { getDay } from "../common/date";
import axios from "axios";
import { toast } from "react-hot-toast";

const CommentCard = ({ index, leftval, commentData, onReplyAdded, onCommentDeleted }) => {
  // Correctly destructure the comment data
  const {
    comment,
    comment_id,
    commented_by, // This is the user_id
    commentedBy, // This is the user object from include
    createdAt, // Use createdAt instead of commentedAt
    children = [],
    isReply,
    parent_comment_id,
    total_replies = 0 // Get from server if available
  } = commentData;

  const { userAuth } = useContext(UserContext);
  const { blog, setBlog } = useContext(BlogContext);

  const [isReplyVisible, setIsReplyVisible] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [replySkip, setReplySkip] = useState(0);
  const [totalRepliesFromServer, setTotalRepliesFromServer] = useState(total_replies || children.length);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);

  // Get user info from the included data (commentedBy is the user object)
  // If commentedBy doesn't exist, create a fallback
  const commentAuthor = commentedBy || {
    fullname: "Anonymous User",
    username: "anonymous",
    profile_img: "/default-profile.png"
  };

  const { fullname, username, profile_img } = commentAuthor;

  // Check if current user is the comment author
  const isCommentAuthor = userAuth?.user_id === commented_by;

  const handleReplyToggle = () => {
    setIsReplyVisible(!isReplyVisible);
  };

  // IMPROVED: Better reply loading with pagination
  const loadReplies = async (skip = 0, append = false) => {
    if ((loadingReplies && !append) || (loadingMoreReplies && append)) return;

    if (append) {
      setLoadingMoreReplies(true);
    } else {
      setLoadingReplies(true);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-comment-replies`,
        { comment_id, skip }
      );

      if (response.data.success) {
        const newReplies = response.data.replies || [];
        const pagination = response.data.pagination || {};

        // Process replies to ensure proper structure
        const processedReplies = newReplies.map(reply => ({
          ...reply,
          children: reply.children || []
        }));

        if (append) {
          setReplies(prev => [...prev, ...processedReplies]);
        } else {
          setReplies(processedReplies);
          setRepliesVisible(true);
        }

        // Update pagination state
        setReplySkip(skip + newReplies.length);
        
        // Update total replies count from server response
        if (pagination.total !== undefined) {
          setTotalRepliesFromServer(pagination.total);
        }

        console.log(`Loaded ${newReplies.length} replies for comment ${comment_id}`, {
          skip,
          total: pagination.total,
          hasMore: pagination.hasMore,
          currentRepliesCount: append ? replies.length + newReplies.length : newReplies.length
        });

      } else {
        console.error("Failed to load replies:", response.data.error);
        toast.error("Failed to load replies");
      }
    } catch (error) {
      console.error("Error loading replies:", error);
      toast.error("Failed to load replies");
    } finally {
      if (append) {
        setLoadingMoreReplies(false);
      } else {
        setLoadingReplies(false);
      }
    }
  };

  const handleShowReplies = () => {
    if (!repliesVisible && replies.length === 0) {
      loadReplies(0);
    } else {
      setRepliesVisible(!repliesVisible);
    }
  };

  const loadMoreReplies = () => {
    if (hasMoreReplies && !loadingMoreReplies) {
      loadReplies(replySkip, true);
    }
  };

  const handleReplyAdded = () => {
    // When a new reply is added, refresh the replies list
    setIsReplyVisible(false);
    
    // Reset pagination state
    setReplies([]);
    setReplySkip(0);
    setTotalRepliesFromServer(prev => prev + 1); // Increment by 1 for new reply
    
    // Load replies to show the new one if replies were visible
    if (repliesVisible) {
      loadReplies(0);
    }
    
    // Call parent callback
    if (onReplyAdded) onReplyAdded();
  };

  const handleDeleteComment = async () => {
    if (!userAuth?.access_token || !isCommentAuthor) {
      toast.error("You can only delete your own comments");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        {
          data: { comment_id },
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the blog's total comments count
        setBlog(prev => ({
          ...prev,
          total_comments: response.data.total_comments
        }));

        toast.success(response.data.message);
        
        // Call the callback to refresh comments
        if (onCommentDeleted) {
          onCommentDeleted();
        }
      } else {
        toast.error(response.data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      if (error.response?.status === 403) {
        toast.error("You can only delete your own comments");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete comment. Please try again.");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // IMPROVED: Better reply count calculation
  const displayReplyCount = repliesVisible ? replies.length : totalRepliesFromServer;
  const hasMoreReplies = repliesVisible ? replies.length < totalRepliesFromServer : totalRepliesFromServer > 0;

  // IMPROVED: Limit nesting depth to prevent infinite nesting
  const maxNestingDepth = 4; // Reduced from 5 for better UX
  const shouldShowReplies = leftval < maxNestingDepth;

  return (
    <div className="w-full" style={{ paddingLeft: `${Math.min(leftval * 8, 32)}px` }}>
      <div className={`my-4 p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
        isReply 
          ? 'border-grey/50 bg-grey/10 ml-4 border-l-4 border-l-purple/30' 
          : 'border-grey bg-white shadow-sm'
      }`}>
        
        {/* Comment Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <img 
              src={profile_img || "/default-profile.png"} 
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              alt={fullname}
            />
            <div>
              <p className="font-medium text-sm line-clamp-1">
                {fullname}
              </p>
              <p className="text-xs text-dark-grey">
                @{username} • {getDay(createdAt)}
              </p>
            </div>
          </div>

          {/* Delete button - only show for comment author */}
          {isCommentAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="p-2 rounded-full hover:bg-red/10 transition-colors duration-200 group"
                disabled={isDeleting}
                title="Delete comment"
              >
                <svg 
                  className="w-4 h-4 text-dark-grey group-hover:text-red transition-colors duration-200" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>

              {/* Delete confirmation dropdown */}
              {showDeleteConfirm && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-grey rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
                  <p className="text-sm text-dark-grey mb-3">
                    Are you sure you want to delete this {isReply ? 'reply' : 'comment'}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteComment}
                      disabled={isDeleting}
                      className="px-3 py-1 bg-red text-white text-sm rounded hover:bg-red/90 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 bg-grey text-dark-grey text-sm rounded hover:bg-grey/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="mb-4">
          <p className="font-gelasio text-lg leading-relaxed ml-2">{comment}</p>
        </div>

        {/* Comment Actions */}
        <div className="flex gap-4 items-center ml-2">
          {/* Reply button - only show if user is logged in and nesting isn't too deep */}
          {userAuth?.access_token && shouldShowReplies && (
            <button
              className="flex items-center gap-2 text-sm text-dark-grey hover:text-purple transition-colors duration-200 font-medium"
              onClick={handleReplyToggle}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          )}

          {/* Show replies button - only show if there are replies and nesting isn't too deep */}
          {displayReplyCount > 0 && shouldShowReplies && (
            <button
              className="flex items-center gap-2 text-sm text-dark-grey hover:text-black transition-colors duration-200 font-medium"
              onClick={handleShowReplies}
              disabled={loadingReplies}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {loadingReplies ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                  Loading...
                </div>
              ) : (
                repliesVisible ? "Hide Replies" : 
                `${displayReplyCount} ${displayReplyCount === 1 ? 'Reply' : 'Replies'}`
              )}
            </button>
          )}

          {/* Show max depth reached message */}
          {!shouldShowReplies && displayReplyCount > 0 && (
            <span className="text-xs text-dark-grey italic">
              Maximum reply depth reached • {displayReplyCount} {displayReplyCount === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {/* Reply field */}
        {isReplyVisible && shouldShowReplies && (
          <div className="mt-6 pl-4 border-l-2 border-purple/20">
            <CommentField 
              action="reply" 
              replyingTo={comment_id}
              onCommentAdded={handleReplyAdded}
            />
          </div>
        )}

        {/* Replies */}
        {repliesVisible && shouldShowReplies && (
          <div className="mt-6">
            {replies.length > 0 ? (
              <div className="space-y-2">
                {replies.map((reply, i) => (
                  <CommentCard
                    key={reply.comment_id}
                    index={i}
                    leftval={leftval + 1} // Increment nesting level
                    commentData={reply}
                    onReplyAdded={handleReplyAdded}
                    onCommentDeleted={onCommentDeleted}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-dark-grey text-sm">
                No replies to show
              </div>
            )}

            {/* IMPROVED: Load More Replies Button */}
            {hasMoreReplies && repliesVisible && (
              <div className="mt-4 pl-4 border-t border-grey/20 pt-4">
                <button
                  onClick={loadMoreReplies}
                  disabled={loadingMoreReplies}
                  className="text-sm text-purple hover:text-purple/80 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple/5"
                >
                  {loadingMoreReplies ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                      Loading more replies...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Load more replies ({totalRepliesFromServer - replies.length} remaining)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close delete confirmation */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default CommentCard;