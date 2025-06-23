import { useContext, useEffect, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";
import axios from "axios";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", 
      { blog_id, skip }
    );
    
    const { data } = response;
    
    // Check if the response has the expected structure
    if (data.success && data.comments) {
      const comments = data.comments;
      
      // Update parent comment count
      if (setParentCommentCountFun) {
        setParentCommentCountFun(prevVal => prevVal + comments.length);
      }

      // Return results in the expected format
      if (comment_array == null) {
        return { 
          results: comments,
          pagination: data.pagination 
        };
      } else {
        return { 
          results: [...comment_array, ...comments],
          pagination: data.pagination 
        };
      }
    } else {
      console.error("Unexpected response structure:", data);
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
    setCommentsWrapper 
  } = useContext(BlogContext);

  const [isLoading, setIsLoading] = useState(false);
  const [parentCommentCount, setParentCommentCount] = useState(0);

  // Get comment array safely
  const comment_array = comments?.results || [];

  // Load initial comments when component mounts or blog changes
  useEffect(() => {
    if (blog_id && commentsWrapper && comment_array.length === 0) {
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
        comment_array: skip > 0 ? comment_array : null
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

  // Function to refresh comments (can be called after adding a new comment)
  const refreshComments = () => {
    setComments({ results: [] });
    setParentCommentCount(0);
    loadComments(0);
  };

  return (
    <div className={"max-sm:w-full fixed " + (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") + " duration-700 max-sm:right-0 sm:top-0 w-[35%] min-w-[400px] h-full z-50 bg-white shadow-2xl overflow-y-auto overflow-x-hidden"}>
      
      {/* Header Section */}
      <div className="sticky top-0 bg-white border-b border-grey/20 p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-black">Comments</h1>
            <p className="text-sm text-dark-grey mt-1 line-clamp-2">{title}</p>
          </div>
          <button 
            onClick={() => setCommentsWrapper(prevVal => !prevVal)}
            className="flex justify-center items-center w-10 h-10 rounded-full bg-grey/50 hover:bg-grey transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-dark-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Comment Input Section */}
      <div className="p-6 border-b border-grey/20 bg-grey/5">
        <CommentField action="comment" onCommentAdded={refreshComments} />
      </div>
      
      {/* Comments List Section */}
      <div className="flex-1 p-6">
        {/* Loading indicator */}
        {isLoading && comment_array.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-grey border-t-black mb-4"></div>
            <p className="text-dark-grey text-sm">Loading comments...</p>
          </div>
        )}
        
        {/* Comments list */}
        {comment_array && comment_array.length ? (
          <div className="space-y-4">
            {comment_array.map((comment, i) => (
              <AnimationWrapper 
                key={comment.comment_id || i}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <CommentCard 
                  index={i} 
                  leftval={0} // Start with 0 for better visual hierarchy
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
              <div className="w-16 h-16 bg-grey/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-dark-grey" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark-grey mb-2">No comments yet</h3>
              <p className="text-sm text-dark-grey text-center">Be the first to share your thoughts!</p>
            </div>
          )
        )}
        
        {/* Load more button */}
        {comments?.pagination?.hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMoreComments}
              disabled={isLoading}
              className="px-6 py-3 bg-grey hover:bg-black hover:text-white text-dark-grey rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  Loading...
                </div>
              ) : (
                'Load More Comments'
              )}
            </button>
          </div>
        )}
      </div>
    </div>   
  );
};

export default CommentsContainer;