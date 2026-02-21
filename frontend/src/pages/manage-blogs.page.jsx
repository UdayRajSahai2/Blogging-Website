import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { BLOG_API } from "../common/api";

const MyBlogs = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => {
    if (!access_token) {
      setLoading(false);
      return; // Wait until token is ready
    }
    axios
      .get(`${BLOG_API}/user-blogs`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(({ data }) => {
        setBlogs(data.blogs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.response?.status, err.response?.data); // debug
        setLoading(false);
      });
  }, [access_token]); // re-run when token changes

  // const handleDelete = async (blog_id) => {
  //   if (deletingId) return;

  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this blog? This action cannot be undone.",
  //   );

  //   if (!confirmDelete) return;

  //   try {
  //     setDeletingId(blog_id);

  //     await axios.delete(`${BLOG_API}/delete-blog/${blog_id}`, {
  //       headers: { Authorization: `Bearer ${access_token}` },
  //     });

  //     setBlogs((prev) => prev.filter((b) => b.blog_id !== blog_id));
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to delete blog. Please try again.");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  if (loading) return <Loader />;

  return (
    <AnimationWrapper>
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Blogs</h1>

        {!blogs.length ? (
          <p className="text-gray-500">You haven’t written any blogs yet.</p>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog.blog_id}
                className="flex gap-4 bg-white border rounded-lg p-4 hover:shadow transition"
              >
                <img
                  src={blog.banner}
                  alt="blog banner"
                  className="w-32 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="text-lg font-semibold line-clamp-1">
                    {blog.title}
                  </h2>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {blog.des}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        blog.draft
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {blog.draft ? "Draft" : "Published"}
                    </span>

                    <Link
                      to={`/editor/${blog.blog_id}`}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Edit
                    </Link>

                    {!blog.draft && (
                      <Link
                        to={`/blog/${blog.blog_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    )}
                    {/* <button
                      onClick={() => handleDelete(blog.blog_id)}
                      disabled={deletingId === blog.blog_id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === blog.blog_id ? "Deleting..." : "Delete"}
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AnimationWrapper>
  );
};

export default MyBlogs;
