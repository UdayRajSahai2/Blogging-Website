import { useContext,useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  const { blog, activity, blogAuthor, setBlog, isLikedByUser, setLikedByUser,commentsWrapper,setCommentsWrapper } =
    useContext(BlogContext) || {};

  const userContext = useContext(UserContext);
  console.log("User context",userContext);
  const userAuth = userContext?.userAuth || {};
  const { username, access_token, user_id: currentUserId } = userAuth;

  console.log("User auth data:", { username, access_token, currentUserId });

  // Destructure with fallbacks
  const {  total_likes = 0, total_comments = 0 , title = "", blog_id = "" } = blog || {};
  const { username: author_username = "" } = blogAuthor || {};
  
  // Check initial like status when component mounts
  useEffect(() => {
    if (access_token && blog_id) {
      checkLikeStatus();
    }
  }, [access_token, blog_id]);

   const checkLikeStatus = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/check-like`,
        { blog_id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      setLikedByUser(response.data.isLiked);
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };
const handleLike = async () => {
  if (!access_token || !currentUserId) {
    toast.error("Please login to like this blog");
    return;
  }

  try {
    const newLikeStatus = !isLikedByUser;
    
    // Optimistic update
    setLikedByUser(newLikeStatus);
          setBlog(prev => ({
        ...prev,
        total_likes: newLikeStatus ? prev.total_likes + 1 : Math.max(0, prev.total_likes - 1)
      }));
    
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/handle-like`,
      { blog_id: blog_id.trim(), isLiked: newLikeStatus },
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
   
    // Verify the response structure
    console.log("Server response:", response.data);

    // Update state with server response
    if (response.data.success) {
      setBlog(prev => ({
        ...prev,
          total_likes: response.data.total_likes
      }));
      setLikedByUser(response.data.isLiked);
    }
  } catch (err) {
    console.error("Like error:", err);
    // Revert optimistic update
    setLikedByUser(prev => !prev);
    setBlog(prev => ({
      ...prev,
        total_likes: isLikedByUser 
          ? prev.total_likes - 1 
          : prev.total_likes + 1
    }));
    setLikedByUser(prev => !prev);
    toast.error(err.response?.data?.message || "Failed to update like");
  }
};

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="flex justify-between items-center">
        {/* Left side - Likes and Comments */}
        <div className="flex gap-6">    
          <div className="flex gap-2 items-center">
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80"} hover:bg-blue/20`}
            >
              <i className={"fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
            </button>
            <p className="text-xl text-dark-grey">{total_likes}</p>
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={() => {
              setCommentsWrapper(preval => !preval)
            }} className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 hover:bg-blue/20">
              <i className="fi fi-rs-comment-dots text-xl"></i>
            </button>
            <p className="text-xl text-dark-grey">{total_comments}</p>
          </div>
        </div>

        {/* Right side - Edit and Twitter */}
        <div className="flex items-center gap-4">
          {username === author_username && (
            <Link
              to={{
                pathname: `/editor/${blog_id}`,
                state: { blogData: blog }, // Pass entire blog data
              }}
              className="flex items-center gap-1 underline hover:text-purple"
            >
              <i className="fi fi-rr-edit text-sm"></i>
              <span>Edit</span>
            </Link>
          )}

          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
            className="flex items-center text-xl hover:text-twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fi fi-brands-twitter"></i>
          </Link>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
