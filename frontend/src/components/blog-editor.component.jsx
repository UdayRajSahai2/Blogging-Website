import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { uploadImage } from "../common/aws";
import { useEffect, useRef, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";
import { BLOG_API } from "../common/api";

const BlogEditor = () => {
  const blogBannerRef = useRef();

  const { blog, setBlog, textEditor, setTextEditor, setEditorState } =
    useContext(EditorContext);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const { blog_id } = useParams();
  const navigate = useNavigate();

  // Initialize EditorJS once
  useEffect(() => {
    if (!textEditor?.instance) {
      const editor = new EditorJS({
        holder: "textEditor",
        data: blog.content || { blocks: [] },
        tools: tools,
        placeholder: "Let's write an awesome story...",
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
      toast.success("Banner uploaded 👍");
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
    setBlog({ ...blog, title: input.value });
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
    if (!blog.banner) return toast.error("Upload a blog banner to publish it");
    if (!blog.title) return toast.error("Write blog title to publish it");

    if (textEditor.isReady) {
      textEditor.instance.save().then((data) => {
        if (!data?.blocks?.length)
          return toast.error("Write something in your blog to publish it");

        setBlog({ ...blog, content: data });
        setEditorState("publish");
      });
    }
  };

  // Save draft
  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) return;

    if (!blog.title || !blog.title.trim()) {
      return toast.error("Write blog title before saving draft");
    }

    const loadingToast = toast.loading("Saving draft...");
    e.target.classList.add("disable");

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
              { headers: { Authorization: `Bearer ${access_token}` } },
            )
            .then(() => {
              e.target.classList.remove("disable");
              toast.dismiss(loadingToast);
              toast.success("Saved 👍");
              setTimeout(() => navigate("/"), 500);
            })
            .catch((err) => {
              e.target.classList.remove("disable");
              toast.dismiss(loadingToast);

              // Safely extract error message
              const errorMessage =
                err?.response?.data?.error ||
                err?.message ||
                "Something went wrong";
              toast.error(errorMessage);
            });
        })
        .catch((err) => {
          // Catch EditorJS save errors
          e.target.classList.remove("disable");
          toast.dismiss(loadingToast);
          const errorMessage = err?.message || "Failed to save editor content";
          toast.error(errorMessage);
        });
    }
  };

  return (
    <>
      <Toaster />
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-40 flex-wrap gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} className="w-10 h-10 object-contain" alt="Logo" />
          <span className="text-xl font-bold text-purple hidden sm:inline">
            Connect Me
          </span>
        </Link>

        {/* Title preview */}
        <p className="text-gray-700 text-sm sm:text-base truncate flex-1 text-center sm:text-left">
          {blog.title?.trim() ? blog.title : "New Blog"}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            className="bg-purple text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple/90 transition"
            onClick={handlePublishEvent}
          >
            Publish
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-300 transition"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section className="py-6 px-4 sm:px-8 md:px-12">
          <div className="mx-auto max-w-[900px] w-full">
            {/* Banner Upload */}
            <div className="relative aspect-video border-4 border-gray-200 bg-white rounded-md overflow-hidden group">
              <label htmlFor="uploadBanner" className="cursor-pointer">
                <img
                  src={blog.banner || defaultBanner}
                  alt="Blog Banner"
                  className="w-full h-full object-cover group-hover:opacity-80 transition"
                  onError={handleError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            {/* Blog Title */}
            <textarea
              value={blog.title}
              placeholder="Blog Title"
              className="text-3xl sm:text-4xl font-semibold w-full h-auto outline-none resize-none mt-8 mb-4 leading-tight placeholder:opacity-40 bg-transparent"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            {/* Divider */}
            <hr className="w-full border-gray-300 opacity-30 mb-5" />

            {/* EditorJS Mount Point */}
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
