import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../../imgs/logo.png";
import AnimationWrapper from "../../common/page-animation";
import defaultBanner from "../../imgs/blog-banner.png";
import { uploadImage, deleteImage } from "../../common/aws";
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
  // STATES
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  // LOAD CATEGORIES FROM BACKEND
  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const res = await axios.get(`${BLOG_API}/taxonomy`);

        const data = res.data.data || [];

        // GROUP TAXONOMY
        const grouped = [];

        data.forEach((item) => {
          let category = grouped.find((c) => c.category === item.category);

          if (!category) {
            category = {
              category: item.category,
              subcategories: [],
            };

            grouped.push(category);
          }

          let subcategory = category.subcategories.find(
            (s) => s.name === item.subcategory,
          );

          if (!subcategory) {
            subcategory = {
              name: item.subcategory,
              subSubCategories: [],
            };

            category.subcategories.push(subcategory);
          }

          if (
            item.sub_subcategory &&
            !subcategory.subSubCategories.includes(item.sub_subcategory)
          ) {
            subcategory.subSubCategories.push(item.sub_subcategory);
          }
        });

        setCategories(grouped);
      } catch (error) {
        console.error(error);

        toast.error("Failed to load blog taxonomy");
      }
    };

    fetchTaxonomy();
  }, []);
  // RESTORE CATEGORY STATE FOR EDIT MODE
  useEffect(() => {
    if (!blog.category || !categories.length) return;

    const foundCategory = categories.find(
      (item) => item.category === blog.category,
    );

    if (foundCategory) {
      setSubcategories(foundCategory.subcategories || []);

      const foundSubcategory = foundCategory.subcategories.find(
        (item) => item.name === blog.subcategory,
      );

      if (foundSubcategory) {
        setSubSubCategories(foundSubcategory.subSubCategories || []);
      }
    }
  }, [blog.category, blog.subcategory, categories]);
  // CATEGORY CHANGE
  const handleCategoryChange = (category) => {
    setBlog({
      ...blog,
      category,
      subcategory: "",
      sub_subcategory: "",
    });
    const found = categories.find((item) => item.category === category);

    setSubcategories(found?.subcategories || []);
    setSubSubCategories([]);
  };

  // SUBCATEGORY CHANGE
  const handleSubcategoryChange = (subcategory) => {
    setBlog({
      ...blog,
      subcategory,
      sub_subcategory: "",
    });

    const found = subcategories.find((item) => item.name === subcategory);

    setSubSubCategories(found?.subSubCategories || []);
  };
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
      // DELETE OLD BANNER
      if (blog.bannerKey) {
        await deleteImage(blog.bannerKey);
      }

      // UPLOAD NEW BANNER
      const data = await uploadImage(img);

      // UPDATE STATE
      setBlog((prev) => ({
        ...prev,
        banner: data.fileURL,
        bannerKey: data.key,
      }));

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
    if (!blog.category || !blog.subcategory || !blog.sub_subcategory) {
      return toast.error(
        "Please complete blog category selection before publishing",
      );
    }
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
  // CAPITALIZE FIRST LETTERS
  const capitalizeWords = (text = "") => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
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

                  {/* Overlay */}
                  {!blog.banner && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <div className="text-4xl mb-8">＋</div>

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

                {/* Remove Button */}
                {blog.banner && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // DELETE FROM S3
                        if (blog.bannerKey) {
                          await deleteImage(blog.bannerKey);
                        }

                        // CLEAR STATE
                        setBlog((prev) => ({
                          ...prev,
                          banner: "",
                          bannerKey: "",
                        }));

                        toast.success("Banner removed");
                      } catch (err) {
                        toast.error(err.message || "Failed to remove banner");
                      }
                    }}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md shadow-md z-10"
                  >
                    Remove
                  </button>
                )}
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-1">
              {/* CATEGORY */}
              <div className="lg:col-span-3">
                <div
                  className="
      h-40 border border-gray-300 rounded-lg
      bg-white p-3
      focus-within:border-purple-500
      focus-within:ring-1
      focus-within:ring-purple-500
      transition
    "
                >
                  <p className="text-gray-700 text-sm font-medium mb-1">
                    Blog category
                  </p>

                  <div className="grid gap-2">
                    {/* Blog Taxonomy categories */}
                    {/* Blog Taxonomy categories */}
                    <select
                      value={blog.category || ""}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="
    px-3 py-2 text-sm border border-gray-300
    rounded-md outline-none
    focus:border-purple-500
  "
                    >
                      <option value="">Select Category</option>

                      {categories.map((item) => (
                        <option key={item.category} value={item.category}>
                          {capitalizeWords(item.category)}
                        </option>
                      ))}
                    </select>

                    {/* SUBCATEGORY */}
                    <select
                      value={blog.subcategory || ""}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      disabled={!blog.category}
                      className="
    px-3 py-2 text-sm border border-gray-300
    rounded-md outline-none
    focus:border-purple-500
    disabled:bg-gray-100
  "
                    >
                      <option value="">Select Subcategory</option>

                      {subcategories.map((item) => (
                        <option key={item.name} value={item.name}>
                          {capitalizeWords(item.name)}
                        </option>
                      ))}
                    </select>

                    {/* SUB SUBCATEGORY */}
                    <select
                      value={blog.sub_subcategory || ""}
                      onChange={(e) =>
                        setBlog({
                          ...blog,
                          sub_subcategory: e.target.value,
                        })
                      }
                      disabled={!blog.subcategory}
                      className="
    px-3 py-2 text-sm border border-gray-300
    rounded-md outline-none
    focus:border-purple-500
    disabled:bg-gray-100
  "
                    >
                      <option value="">Select SubSubCategory</option>

                      {subSubCategories.map((item) => (
                        <option key={item} value={item}>
                          {capitalizeWords(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* DESCRIPTION */}
              <div className="lg:col-span-4 relative">
                <p className="absolute left-4 top-2 text-gray-700 text-sm font-medium pointer-events-none">
                  Blog description
                </p>

                <textarea
                  maxLength={200}
                  value={blog.des || ""}
                  placeholder="Write a short summary..."
                  className="
        h-40 w-full resize-none
        leading-6 text-sm
        px-4 pt-7 pb-3 pr-16
        border border-gray-300 rounded-lg bg-white
        outline-none
        focus:border-purple-500
        focus:ring-1 focus:ring-purple-500
        transition placeholder:text-gray-400
      "
                  onChange={(e) =>
                    setBlog({
                      ...blog,
                      des: e.target.value,
                    })
                  }
                />

                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {blog.des?.length || 0} / 200
                </span>
              </div>

              {/* TAGS */}
              <div className="lg:col-span-5">
                <div
                  className="
      relative h-40 border border-gray-300
      rounded-lg bg-white px-3 pt-3 pb-8
      focus-within:border-purple-500
      focus-within:ring-1
      focus-within:ring-purple-500
      transition
    "
                >
                  <p className="text-gray-700 text-sm font-medium mb-2">
                    Add keywords (maximum 10)
                  </p>

                  <input
                    type="text"
                    placeholder={
                      blog.tags.length >= 10
                        ? "Tag limit reached"
                        : "Enter tags separated by comma — e.g. Education,Social,Politics"
                    }
                    className="w-full outline-none text-sm mb-3 bg-transparent"
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
                          setBlog({
                            ...blog,
                            tags: [...blog.tags, tag],
                          });
                        }

                        e.target.value = "";
                      }
                    }}
                  />

                  <div
                    className="
        flex flex-wrap gap-2
        max-h-[75px]
        overflow-y-auto
        pr-1
      "
                  >
                    {blog.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="
            bg-gray-200 px-2 py-1 rounded text-sm
            cursor-pointer hover:bg-gray-300 transition
          "
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
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-0.5 border-b border-gray-200">
            {/* LEFT INFO */}
            <div className="hidden md:block text-[12px] text-gray-500">
              <span className="font-medium text-gray-700">Save Draft:</span>{" "}
              Save your blog and continue later •{" "}
              <span className="font-medium text-gray-700">Publish Blog:</span>{" "}
              Submit for review and publishing
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex justify-center sm:justify-end gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || blog.status === "pending"}
                className={`
      px-4 py-2 rounded-md text-sm font-medium transition
      border border-slate-300
      bg-slate-100 text-slate-700

      ${
        isSaving || blog.status === "pending"
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-slate-200"
      }
    `}
              >
                {blog.status === "pending"
                  ? "Waiting for Approval"
                  : isSaving
                    ? "Saving..."
                    : "Save Draft"}
              </button>

              <button
                onClick={handlePublishEvent}
                disabled={isPublishing || blog.status === "pending"}
                className={`
      px-4 py-2 rounded-md text-sm font-medium transition
      bg-indigo-600 text-white

      ${
        isPublishing || blog.status === "pending"
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-indigo-700"
      }
    `}
              >
                {blog.status === "pending"
                  ? "Submitted"
                  : isPublishing
                    ? "Publishing..."
                    : "Publish Blog"}
              </button>
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
