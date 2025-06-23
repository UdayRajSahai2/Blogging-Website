import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer from "../components/comments.component";

export const blogStructure = {
  title: "",
  des: "",
  content: {
    time: 0,
    blocks: [],
    version: ""
  },
  tags: [],
  blogAuthor: {},
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  
  // Add comments state
  const [comments, setComments] = useState({ results: [] });

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
      .then(({ data: { blog } }) => {
        // Parse content if it's a string
        const parsedContent = typeof blog.content === 'string' 
          ? JSON.parse(blog.content) 
          : blog.content;

        // Parse tags if they're in JSON string format
        const parsedTags = typeof blog.tags === "string" 
          ? JSON.parse(blog.tags) 
          : blog.tags;

        // Update blog with parsed content
        const updatedBlog = {
          ...blog,
          content: parsedContent || blogStructure.content,
          tags: parsedTags
        };

        setBlog(updatedBlog);

        // Only make the search request if tags exist
        if (parsedTags && parsedTags.length) {
          axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
              tag: parsedTags[0],
              limit: 6,
              eliminate_blog: blog_id,
            })
            .then(({ data }) => {
              setSimilarBlogs(data.blogs);
            })
            .catch((err) => console.log("Error fetching similar blogs:", err));
        }

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetStates();
    fetchBlog();
  }, [blog_id]);

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
    setComments({ results: [] }); // Reset comments
  }

  // Destructure after state is updated
  const {
    title,
    content,
    banner,
    blogAuthor: { fullname, username: author_username, profile_img } = {},
    publishedAt,
    tags,
  } = blog;

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            blogAuthor: blog.blogAuthor,
            activity: blog.activity || {},
            isLikedByUser,
            setLikedByUser,
            commentsWrapper,
            setCommentsWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
            comments, // Add comments to context
            setComments // Add setComments to context
          }}
        >
          <CommentsContainer />
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video" alt="Blog banner" />
            <div className="mt-12">
              <h2>{title}</h2>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img src={profile_img} className="w-12 h-12 rounded-full" alt="Author profile" />
                  <p className="capitalize">
                    {fullname}
                    <br />@
                    <Link to={`/user/${author_username}`} className="underline">
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {getDay(publishedAt)}
                </p>
              </div>
            </div>
            <BlogInteraction />
            
            {/* Blog Content Section */}
            <div className="my-12 font-gelasio blog-page-content">
              {content?.blocks?.length > 0 ? (
                content.blocks.map((block, i) => (
                  <div key={i} className="my-4 md:my-8"> 
                    <BlogContent block={block} />
                  </div>
                ))
              ) : (
                <p className="text-dark-grey">No content available</p>
              )}
            </div>

            <BlogInteraction />
            
            {/* Similar Blogs Section */}
            {similarBlogs !== null && similarBlogs.length > 0 ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blogs
                </h1>
                {similarBlogs.map((blog, i) => {
                  let { blogAuthor } = blog;
                  return (
                    <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                      <BlogPostCard content={blog} author={blogAuthor} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : null}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;