// frontend/src/components/admin/pages/PageForm.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminPage,
  getAdminPageById,
  updateAdminPage,
} from "../../../api/admin/admin.page.api";

import SectionBuilder from "./SectionBuilder";
import HeroSection from "./BannerSection";
import ContentSection from "./ContentSection";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
const inputClass =
  "w-full border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gray-500";

const labelClass = "mb-1 block text-[13px] font-medium text-gray-700";

const PageForm = ({ pageId }) => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    path: "",
    status: "draft",
    meta_title: "",
    meta_description: "",
    sections: [],
    show_in_menu: true,
    menu_order: 0,
  });
  const navigate = useNavigate();
  const fetchPage = async () => {
    try {
      const res = await getAdminPageById(pageId);

      setFormData({
        title: res.data.title || "",
        slug: res.data.slug || "",
        path: res.data.path || "",
        status: res.data.status || "draft",
        meta_title: res.data.meta_title || "",
        meta_description: res.data.meta_description || "",
        sections: res.data.sections || [],
        show_in_menu: res.data.show_in_menu ?? true,

        menu_order: res.data.menu_order ?? 0,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (pageId) {
        await updateAdminPage(pageId, formData);
      } else {
        await createAdminPage(formData);
      }

      alert("Page saved successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const previewComponentMap = {
    banner: HeroSection,
    content: ContentSection,
  };
  return (
    <div className="max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-6 pb-14">
        {/* HEADER */}
        <div className="sticky top-0 z-30 flex items-center justify-between">
          <div>
            <h4 className="text-[14px] font-semibold text-gray-800">
              {pageId ? "Edit Dynamic Page" : "Create Dynamic Page"}
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Manage dynamic page details, SEO, and content sections
            </p>
          </div>

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
    border
    border-gray-300
    bg-slate-700
    px-4
    py-2
    text-sm
    font-medium
    text-white
    hover:bg-slate-800
  "
          >
            ← Back
          </button>

          {/* FIXED ACTION BAR */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50 border-t border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Set page visibility to Published to make the dynamic page live
                  after changes.
                </p>

                <p className="text-xs text-gray-500">
                  Click save after updating page content or sections
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                                                rounded-md bg-black px-5 py-2 text-sm font-medium text-white
                                                 transition hover:bg-gray-800
                                                    disabled:cursor-not-allowed disabled:opacity-50
                                "
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* BASIC + SEO */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* BASIC DETAILS */}

          <div className="border border-gray-300 bg-white p-5 rounded">
            <h4 className="mb-4 text-base font-semibold text-gray-800">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Page Name</label>

                <p className="mb-1 text-[11px] text-gray-500">
                  Display name of the page
                </p>

                <input
                  disabled
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className={labelClass}>URL Name</label>

                <p className="mb-1 text-[11px] text-gray-500">
                  Used in website URL
                </p>

                <input
                  disabled
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="about-us"
                />
              </div>

              <div>
                <label className={labelClass}>Page URL</label>

                <p className="mb-1 text-[11px] text-gray-500">
                  Example: reachfoundationngo.com/about-us
                </p>

                <input
                  disabled
                  type="text"
                  name="path"
                  value={formData.path}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="/about-us"
                />
              </div>

              <div>
                <label className={labelClass}>Page Visibility</label>

                <p className="mb-1 text-[11px] text-gray-500">
                  Control whether page is visible publicly
                </p>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>

                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="mt-4 border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 rounded">
              <span className="font-semibold">Page Visibility:</span> Draft =
              hidden, Published = live on website
            </div>
          </div>

          {/* SEO */}
          <div className="border border-gray-300 bg-white p-5 rounded">
            <h4 className="mb-4 text-base font-semibold text-gray-800">
              SEO Information
            </h4>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Google Search Title</label>

                <p className="mb-1 text-[11px] text-gray-500">
                  Appears in Google search results
                </p>

                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className={labelClass}>Google Search Description</label>

                <p className="mb-1 text-[11px] text-gray-500">
                  Short description shown in search engines
                </p>

                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Short SEO description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTIONS */}
        {formData.path !== "/" && (
          <div className="border border-gray-300 bg-white p-5 rounded">
            <div className="mb-4">
              <h4 className="text-base font-semibold text-gray-800">
                Sections
              </h4>

              <p className="mt-1 text-[12px] text-gray-500">
                Manage dynamic page layout by adding a Banner section first,
                then add the Content section.
              </p>
            </div>

            <SectionBuilder
              sections={formData.sections}
              setSections={(sections) =>
                setFormData({
                  ...formData,
                  sections,
                })
              }
            />
          </div>
        )}

        {/* LIVE PREVIEW */}
        {formData.path !== "/" && (
          <div className="border border-gray-400">
            {/* HEADER */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <div>
                <h4 className="text-[14px] font-medium text-gray-700">
                  Live Preview
                </h4>

                <p className="mt-1 text-xs text-gray-500">
                  Preview how page content will appear
                </p>
              </div>

              <div className="text-gray-500">
                {showPreview ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* BODY */}
            {showPreview && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="space-y-6">
                  {formData.sections?.length > 0 ? (
                    formData.sections.map((section, index) => {
                      const Component = previewComponentMap[section.type];

                      if (!Component) return null;

                      return <Component key={index} data={section} />;
                    })
                  ) : (
                    <div className="text-sm text-gray-500">
                      No preview available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default PageForm;
