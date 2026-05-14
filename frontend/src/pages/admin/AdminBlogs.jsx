import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import { ADMIN_API } from "../../common/api";
import toast from "react-hot-toast";

const statusColors = {
  draft: "bg-gray-200 text-gray-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminBlogs = () => {
  const { userAuth } = useContext(UserContext);
  const token = userAuth?.access_token;

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [rejectModal, setRejectModal] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [deletedFilter, setDeletedFilter] = useState("active");
  const [noteModal, setNoteModal] = useState({
    open: false,
    text: "",
  });
  const [bannerModal, setBannerModal] = useState({
    open: false,
    src: "",
  });
  const [viewModal, setViewModal] = useState({
    open: false,
    blog: null,
  });
  // ================= DEBOUNCE =================
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // ================= FETCH BLOGS =================
  const fetchBlogs = useCallback(
    async (signal) => {
      if (!token) return;

      try {
        setLoading(true);

        const { data } = await axios.get(`${ADMIN_API}/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page,
            limit: 10,
            search: debouncedSearch || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
          signal,
        });

        setBlogs(data?.data || []);
        setTotalPages(data?.pagination?.total || 1);
        setTotalBlogs(data?.pagination?.total || 0);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        toast.error("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    },
    [token, page, debouncedSearch, statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchBlogs(controller.signal);
    return () => controller.abort();
  }, [fetchBlogs]);

  // ================= ACTIONS =================

  const updateStatus = async (blogId, status, note = "") => {
    try {
      setProcessingId(blogId);

      await axios.patch(
        `${ADMIN_API}/blogs/${blogId}/status`,
        { status, review_note: note },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`Blog ${status}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const softDelete = async (blogId) => {
    if (!window.confirm("Soft delete this blog?")) return;

    try {
      setProcessingId(blogId);

      await axios.delete(`${ADMIN_API}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Blog deleted");
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setProcessingId(null);
    }
  };
  const hardDelete = async (blogId) => {
    if (!window.confirm("Permanently delete this blog? This cannot be undone!"))
      return;

    try {
      setProcessingId(blogId);

      await axios.delete(`${ADMIN_API}/blogs/${blogId}/permanent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Blog permanently deleted");
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Permanent delete failed");
    } finally {
      setProcessingId(null);
    }
  };
  const restoreBlog = async (blogId) => {
    try {
      setProcessingId(blogId);

      await axios.patch(
        `${ADMIN_API}/blogs/${blogId}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Blog restored");
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Restore failed");
    } finally {
      setProcessingId(null);
    }
  };

  // ================= UI =================

  if (loading && !blogs.length) {
    return <div className="p-6 text-gray-500">Loading blogs...</div>;
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Blog Moderation</h1>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 p-2 border rounded-lg"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="text-sm font-semibold text-slate-700">
          Total Blogs: <span className="text-black">{totalBlogs}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm pb-2">
        <table className="w-full text-sm min-w-[900px] ">
          <thead className="bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="p-3 w-[320px]">Blog</th>
              <th className="p-3 w-[200px]">Author</th>
              <th className="p-3 w-[120px]">Status</th>
              <th className="p-3 w-[90px]">Deleted</th>
              <th className="p-3 w-[120px]">Review</th>
              <th className="p-3 w-[150px]">Created</th>
              <th className="p-3 w-[150px]">Reviewed</th>
              <th className="p-3 text-center w-[220px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {blogs.map((b) => {
              const isProcessing = processingId === b.blog_id;
              const isPublished = b.status === "published";
              const isRejected = b.status === "rejected";

              return (
                <tr
                  key={b.blog_id}
                  className="border-t hover:bg-gray-50 align-middle"
                >
                  {/* BLOG */}
                  <td className="p-3">
                    <div className="flex gap-3 items-center">
                      <img
                        src={b.banner}
                        alt="banner"
                        className="w-16 h-12 object-fill rounded-md flex-shrink-0 cursor-pointer hover:scale-105 transition"
                        onClick={() =>
                          setBannerModal({
                            open: true,
                            src: b.banner,
                          })
                        }
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-medium line-clamp-1">
                          {b.title}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          {b.des || "No description"}
                        </p>

                        <button
                          className="text-[11px] text-blue-600 hover:underline mt-1"
                          onClick={() => setViewModal({ open: true, blog: b })}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* AUTHOR */}
                  <td className="p-3">
                    <div className="text-sm leading-tight">
                      <p className="font-medium">{b.blogAuthor?.fullname}</p>
                      <p className="text-xs text-gray-500">
                        @{b.blogAuthor?.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">
                        {b.blogAuthor?.email}
                      </p>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* DELETED */}
                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                    {b.is_deleted ? "Yes" : "No"}
                  </td>

                  {/* REVIEW NOTE */}
                  <td className="p-3 whitespace-nowrap">
                    {b.review_note ? (
                      <button
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                        onClick={() =>
                          setNoteModal({
                            open: true,
                            text: b.review_note,
                          })
                        }
                      >
                        View note
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* CREATED */}
                  <td className="p-3 text-xs whitespace-nowrap">
                    <div className="leading-tight">
                      {new Date(b.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-gray-400">
                        {new Date(b.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>

                  {/* REVIEWED */}
                  <td className="p-3 text-xs whitespace-nowrap">
                    {b.reviewed_at ? (
                      <div className="leading-tight">
                        {new Date(b.reviewed_at).toLocaleDateString()}
                        <br />
                        <span className="text-gray-400">
                          {new Date(b.reviewed_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-2 py-2">
                    <div className="grid grid-cols-2 gap-1 min-w-[160px]">
                      {!b.is_deleted ? (
                        <>
                          <button
                            disabled={isProcessing || isPublished}
                            className="bg-green-500 hover:bg-green-600 text-white text-[11px] py-1 rounded-md disabled:opacity-40"
                            onClick={() => updateStatus(b.blog_id, "published")}
                          >
                            Approve
                          </button>

                          <button
                            disabled={isProcessing || isRejected}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-[11px] py-1 rounded-md disabled:opacity-40"
                            onClick={() => {
                              setSelectedBlogId(b.blog_id);
                              setReviewNote("");
                              setRejectModal(true);
                            }}
                          >
                            Reject
                          </button>

                          <button
                            disabled={isProcessing}
                            className="bg-red-500 hover:bg-red-600 text-white text-[11px] py-1 rounded-md col-span-2"
                            onClick={() => softDelete(b.blog_id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled={isProcessing}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] py-1 rounded-md"
                            onClick={() => restoreBlog(b.blog_id)}
                          >
                            Restore
                          </button>

                          <button
                            disabled={isProcessing}
                            className="bg-black hover:bg-gray-800 text-white text-[11px] py-1 rounded-md"
                            onClick={() => hardDelete(b.blog_id)}
                          >
                            Delete Permanently
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-1">Reject Blog</h3>

            {/*  Limit hint */}
            <p className="text-xs text-gray-400 mb-2">
              Enter rejection reason (max 500 characters)
            </p>

            {/*  Textarea */}
            <div className="relative">
              <textarea
                placeholder="Enter rejection reason..."
                value={reviewNote}
                maxLength={500} // enforce limit
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 h-24 pr-14 resize-none outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
              />

              {/*  Counter inside */}
              <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                {reviewNote.length} / 500
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => setRejectModal(false)}
              >
                Cancel
              </button>

              <button
                disabled={!reviewNote.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-40"
                onClick={async () => {
                  await updateStatus(selectedBlogId, "rejected", reviewNote);
                  setRejectModal(false);
                }}
              >
                Reject Blog
              </button>
            </div>
          </div>
        </div>
      )}
      {noteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-[90%]">
            <h3 className="text-lg font-semibold mb-3">Review Note</h3>

            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {noteModal.text}
            </p>
            <p className="text-xs text-gray-400 text-right mt-2">
              {noteModal.text?.length || 0} / 500
            </p>

            <button
              className="mt-5 px-4 py-2 bg-black text-white rounded-lg"
              onClick={() => setNoteModal({ open: false, text: "" })}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {bannerModal.open && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setBannerModal({ open: false, src: "" });
            }
          }}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:scale-110 transition"
            onClick={() => setBannerModal({ open: false, src: "" })}
          >
            ×
          </button>

          {/* Image */}
          <img
            src={bannerModal.src}
            alt="Full banner"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
      {viewModal.open && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-xl overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h2 className="text-sm font-semibold truncate">
                {viewModal.blog.title}
              </h2>

              <button
                className="text-xl"
                onClick={() => setViewModal({ open: false, blog: null })}
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="overflow-y-auto p-3 space-y-3 text-xs">
              {/* BANNER */}
              <img
                src={viewModal.blog.banner}
                className="w-full max-h-[250px] object-contain rounded-md"
              />

              {/* META */}
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <b>Status:</b> {viewModal.blog.status}
                </p>
                <p>
                  <b>Deleted:</b> {viewModal.blog.is_deleted ? "Yes" : "No"}
                </p>
                <p>
                  <b>Author:</b> {viewModal.blog.blogAuthor?.fullname}
                </p>
                <p>
                  <b>Email:</b> {viewModal.blog.blogAuthor?.email}
                </p>
              </div>

              {/* TITLE */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Title</p>
                <p className="text-sm  text-gray-700">{viewModal.blog.title}</p>
              </div>

              {/* DESCRIPTION */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase">
                  Description
                </p>
                <p className="text-xs text-gray-700">
                  {viewModal.blog.des || "No description"}
                </p>
              </div>
              {/* TAGS */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Tags</p>

                <div className="flex flex-wrap gap-1 mt-1">
                  {(() => {
                    let tags = viewModal.blog?.tags;

                    // Parse stringified tags if needed
                    if (typeof tags === "string") {
                      try {
                        tags = JSON.parse(tags.replace(/'/g, '"'));
                      } catch {
                        tags = [tags];
                      }
                    }

                    // Fallback
                    if (!Array.isArray(tags)) tags = [];

                    // Empty state
                    if (!tags.length) {
                      return (
                        <span className="text-xs text-gray-500">No tags</span>
                      );
                    }

                    return tags.map((tag, i) => (
                      <span
                        key={i}
                        className="
                                    text-[10px]
                                    px-2
                                    py-0.5
                                    rounded-md
                                    bg-purple-50
                                    text-purple-700
                                    border border-purple-100
                           "
                      >
                        #{tag}
                      </span>
                    ));
                  })()}
                </div>
              </div>
              {/* CONTENT */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase">
                  Content/Paragraph
                </p>

                <div className="space-y-2 mt-1">
                  {(() => {
                    let content = viewModal.blog?.content;

                    if (typeof content === "string") {
                      try {
                        content = JSON.parse(content);
                      } catch {
                        content = [];
                      }
                    }

                    if (!Array.isArray(content)) {
                      content = content?.blocks || [content];
                    }

                    return content.map((block, i) => {
                      // TEXT / PARAGRAPH
                      if (
                        block?.type === "text" ||
                        block?.type === "paragraph"
                      ) {
                        return (
                          <p
                            key={i}
                            className="text-xs text-gray-800 leading-relaxed"
                          >
                            {block.value || block.data?.text}
                          </p>
                        );
                      }

                      // IMAGE
                      if (block?.type === "image") {
                        return (
                          <img
                            key={i}
                            src={block.value || block.data?.file?.url}
                            className="w-full max-h-[300px] object-contain rounded"
                          />
                        );
                      }

                      return null;
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
