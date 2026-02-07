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

const BlogEditor = () => {
  const blogBannerRef = useRef();
  const {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: content,
          tools: tools,
          placeholder: "Let's write an awesome story...",
          onReady: () => console.log("Editor ready"),
        })
      );
    }
  }, [content]);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const { blog_id } = useParams();
  const navigate = useNavigate();

  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    if (img) {
      const loadingToast = toast.loading("Uploading...");
      uploadImage(img)
        .then((url) => {
          toast.dismiss(loadingToast);
          toast.success("Uploaded 👍");
          setBlog({ ...blog, banner: url });
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          toast.error(err);
        });
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) e.preventDefault();
  };

  const handleError = (e) => {
    e.target.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner) return toast.error("Upload a blog banner to publish it");
    if (!title) return toast.error("Write blog title to publish it");

    if (textEditor.isReady) {
      textEditor.save().then((data) => {
        if (!data?.blocks?.length) {
          return toast.error("Write something in your blog to publish it");
        }
        setBlog({ ...blog, content: data });
        setEditorState("publish");
      });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) return;
    if (!title.length) return toast.error("Write blog title before saving draft");

    const loadingToast = toast.loading("Saving draft...");
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        const desString = typeof des === "string" ? des : JSON.stringify(des);
        const blogObj = { title, banner, des: desString, content, tags, draft: true };

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved 👍");
            setTimeout(() => navigate("/"), 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.error(response.data.error);
          });
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
          <span className="text-xl font-bold text-purple hidden sm:inline">Connect Me</span>
        </Link>

        {/* Title preview */}
        <p className="text-gray-700 text-sm sm:text-base truncate flex-1 text-center sm:text-left">
          {title.length ? title : "New Blog"}
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
                  src={banner}
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
              defaultValue={title}
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
