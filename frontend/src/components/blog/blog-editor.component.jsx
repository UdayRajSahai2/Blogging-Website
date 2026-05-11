import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../../imgs/logo.png";
import AnimationWrapper from "../../common/page-animation";
import defaultBanner from "../../imgs/blog-banner.png";
import { uploadImage } from "../../common/aws";
import { useEffect, useRef, useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { EditorContext } from "../../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "../blog/tools.component";
import axios from "axios";
import { UserContext } from "../../App";
import { BLOG_API } from "../../common/api";

const BlogEditor = () => {
  const blogBannerRef = useRef();

  const { blog, setBlog, textEditor, setTextEditor, setEditorState } =
    useContext(EditorContext);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const { blog_id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  // Initialize EditorJS once
  useEffect(() => {
    if (!textEditor?.instance) {
      const editor = new EditorJS({
        holder: "textEditor",
        data: blog.content || { blocks: [] },
        tools: tools,
        placeholder: "Start writing an awesome story....",
        onReady: () => setTextEditor({ instance: editor, isReady: true }),
      });
      setTextEditor({ instance: editor, isReady: false });
    }
  }, []);

  // Handle banner upload
  const handleBannerUpload = async (e) => {
    const img = e.target.files?.[0];
    if (!img) return;

    const loadingToast = toast.loading("Uploading...");

    try {
      // Upload image to S3 via presigned URL
      const url = await uploadImage(img);

      // Update blog state with new banner URL
      setBlog((prev) => ({ ...prev, banner: url }));

      toast.dismiss(loadingToast);
      toast.success("Banner uploaded");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to upload banner image");
    }
  };

  // Handle title input
  const handleTitleChange = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    input.style.overflow = "hidden";
    setBlog({ ...blog, title: input.value });
    if (e.target.value.length > 10) {
      toast.success("Nice title.", { id: "title-feedback" });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) e.preventDefault();
  };

  // Banner fallback
  const handleError = (e) => {
    e.target.src = defaultBanner;
  };

  // Publish blog
  const handlePublishEvent = () => {
    if (isPublishing) return;
    if (!blog.banner) return toast.error("Upload banner");
    if (!blog.title) return toast.error("Write title");
    if (blog.status === "pending") {
      return toast.error("Already submitted.");
    }
    if (!blog.des?.trim() || blog.des.length > 200) {
      return toast.error("Write a proper description (max 200 chars)");
    }

    if (!blog.tags || !blog.tags.length) {
      return toast.error("Add at least 1 tag");
    }

    //  WINDOW CONFIRM
    const confirmPublish = window.confirm(
      "Are you sure you want to publish this blog?",
    );

    if (!confirmPublish) return;

    if (isPublishing) return;
    setIsPublishing(true);

    if (textEditor.isReady) {
      textEditor.instance.save().then((data) => {
        setBlog({ ...blog, content: data });

        axios
          .post(
            `${BLOG_API}/create-blog`,
            {
              ...blog,
              content: data,
              draft: false,
              id: blog_id || null, //  IMPORTANT
            },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            },
          )
          .then(() => {
            setIsPublishing(false);
            toast.success("Submitted for admin approval");
            navigate("/dashboard/blogs");
          })
          .catch(() => {
            setIsPublishing(false);
            toast.error("Failed to publish");
          });
      });
    }
  };

  // Save draft
  const handleSaveDraft = () => {
    if (blog.status === "pending") {
      return toast.error("This blog is under review and cannot be edited.");
    }
    if (isSaving) return;

    if (!blog.title || !blog.title.trim()) {
      return toast.error("Write blog title before saving draft");
    }

    //  WINDOW CONFIRM
    const confirmDraft = window.confirm(
      "Do you want to save this blog as draft?",
    );

    if (!confirmDraft) return;

    const loadingToast = toast.loading("Saving your draft…");
    setIsSaving(true);

    if (textEditor.isReady) {
      textEditor.instance
        .save()
        .then((contentData) => {
          const desString =
            typeof blog.des === "string" ? blog.des : JSON.stringify(blog.des);

          const blogObj = {
            ...blog,
            content: contentData,
            des: desString,
            draft: true,
          };

          axios
            .post(
              `${BLOG_API}/create-blog`,
              { ...blogObj, id: blog_id || null },
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
              },
            )
            .then(() => {
              setIsSaving(false);
              toast.dismiss(loadingToast);
              toast.success("Draft saved! Redirecting to My Blogs...");
              setTimeout(() => navigate("/dashboard/blogs"), 1500);
            })
            .catch((err) => {
              setIsSaving(false);
              toast.dismiss(loadingToast);

              const errorMessage =
                err?.response?.data?.error ||
                err?.message ||
                "Something went wrong";
              toast.error(errorMessage);
            });
        })
        .catch((err) => {
          setIsSaving(false);
          toast.dismiss(loadingToast);
          toast.error(err?.message || "Failed to save editor content");
        });
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-0.5 py-0.5 border-b border-gray-100 bg-white sticky top-0 z-40 flex-wrap gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            className="w-10 h-10 object-contain"
            alt="reach-foundation-ngo"
          />
          <span className="text-[12px] font-bold text-purple hidden sm:inline">
            REACH Foundation
          </span>
        </Link>

        {/* Title preview */}
        <p className="text-gray-700 text-sm sm:text-base truncate flex-1 text-center sm:text-left">
          {blog.title?.trim() ? blog.title : "New Blog"}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={handlePublishEvent}
            disabled={isPublishing || blog.status === "pending"}
            className={`bg-purple text-white px-4 py-2 rounded-full text-sm font-medium 
  ${
    isPublishing || blog.status === "pending"
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-purple/90"
  }`}
          >
            {blog.status === "pending"
              ? "Submitted"
              : isPublishing
                ? "Publishing..."
                : "Publish Blog"}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || blog.status === "pending"}
            className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium 
  ${
    isSaving || blog.status === "pending"
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-gray-300"
  }`}
          >
            {blog.status === "pending"
              ? "Waiting for Approval"
              : isSaving
                ? "Saving..."
                : "Save for later"}
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section className="pt-0 pb-0 px-1 sm:px-1 md:px-1 max-w-full mx-auto">
          <div className="mx-auto max-w-full w-full">
            <div className="w-full flex justify-center">
              {/* Banner Upload */}
              <div className="relative aspect-video max-h-[300px] sm:max-h-[300px] border-2 border-gray-300 bg-gray-50 rounded-md overflow-hidden group cursor-pointer">
                <label
                  htmlFor="uploadBanner"
                  className="w-full h-full block relative"
                >
                  {/* Image */}
                  <img
                    src={blog.banner || defaultBanner}
                    alt="Cover image for your blog post"
                    className="w-full h-full object-contain group-hover:opacity-70 transition"
                    onError={handleError}
                  />

                  {/* Overlay (ALWAYS visible if no banner) */}
                  {!blog.banner && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 translate-y-10">
                      <div className="text-3xl mb-2">＋</div>
                      <p className="text-sm">Add a cover image to your post</p>
                    </div>
                  )}

                  {/* Input */}
                  <input
                    id="uploadBanner"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    hidden
                    onChange={handleBannerUpload}
                  />
                </label>
              </div>
            </div>
            {/* Blog Title */}
            <textarea
              value={blog.title}
              placeholder="Blog Title"
              className="text-[20px] sm:text-[30px] font-semibold w-full outline-none resize-none overflow-hidden mt-1 mb-0 leading-tight placeholder:opacity-40 bg-transparent"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            {/* Editor */}
            <div
              className="border border-gray-300 rounded-lg bg-white 
focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition p-4"
            >
              {/* Label */}
              <div className=" pb-2 border-b border-gray-300">
                <p className="text-gray-700 text-[12px] font-medium">
                  Write your blog content
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Click the + icon to add text, images, or other content
                </p>
              </div>

              {/* Editorjs */}
              <div className="px-2 py-2 min-h-[200px]">
                <div id="textEditor" className="font-gelasio"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-1">
              {/* LEFT → Description */}
              <div className="relative">
                <p className="absolute left-4 top-2 text-gray-700 text-sm font-medium pointer-events-none">
                  Blog description
                </p>

                <textarea
                  maxLength={200}
                  value={blog.des || ""}
                  placeholder="Write a short summary..."
                  className="h-40 w-full resize-none leading-7 px-4 pt-7 pb-3 pr-16 border border-gray-300 rounded-lg bg-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-gray-400"
                  onChange={(e) => setBlog({ ...blog, des: e.target.value })}
                />

                {/* Counter */}
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {blog.des?.length || 0} / 200
                </span>
              </div>

              {/* RIGHT → Tags */}
              <div>
                <div
                  className="relative border border-gray-300 rounded-lg bg-white px-3 pt-3 pb-8 
                            focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition"
                >
                  <p className="text-gray-700 text-sm font-medium mb-2">
                    Add keywords (maximum 10)
                  </p>
                  {/* Input */}
                  <input
                    type="text"
                    placeholder={
                      blog.tags.length >= 10
                        ? "Tag limit reached"
                        : "Enter tags separated by comma or press Enter — e.g. Education, Politics, Social"
                    }
                    className="w-full outline-none text-sm mb-2 bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();

                        // LIMIT CHECK
                        if (blog.tags.length >= 10) {
                          toast.error("Maximum 10 tags allowed");
                          return;
                        }

                        const tag = e.target.value.trim();

                        if (
                          tag &&
                          !blog.tags
                            .map((t) => t.toLowerCase())
                            .includes(tag.toLowerCase())
                        ) {
                          setBlog({ ...blog, tags: [...blog.tags, tag] });
                        }

                        e.target.value = "";
                      }
                    }}
                  />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-300 transition"
                        onClick={() =>
                          setBlog({
                            ...blog,
                            tags: blog.tags.filter((t) => t !== tag),
                          })
                        }
                      >
                        {tag} ✕
                      </span>
                    ))}
                  </div>

                  {/* Counter inside */}
                  <span
                    className={`absolute bottom-2 right-3 text-xs ${
                      blog.tags.length >= 10 ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {blog.tags.length} / 10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
