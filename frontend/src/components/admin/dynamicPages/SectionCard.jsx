// frontend/src/components/admin/pages/SectionCard.jsx

import HeroSectionForm from "./BannerSectionForm";
import ContentSectionForm from "./ContentSectionForm";
import { useState } from "react";
const sectionLabels = {
  banner: "Banner Section",
  content: "Content Section",
};

const SectionCard = ({
  section,
  index,
  sections,
  updateSection,
  removeSection,
}) => {
  const [open, setOpen] = useState(false);
  const disableBannerDelete =
    section.type === "banner" && sections.some((s) => s.type === "content");
  return (
    <div className="border border-gray-200 bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        {/* LEFT */}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Section {index + 1}
          </p>

          <h4 className="text-sm font-semibold text-gray-800">
            {sectionLabels[section.type] || section.type}
          </h4>

          {/* SUMMARY */}
          <p className="mt-1 truncate text-xs text-gray-500">
            {section.title || section.heading || "No content added yet"}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {open ? "Hide Details" : "Edit Section"}
          </button>

          <button
            type="button"
            disabled={disableBannerDelete}
            onClick={() => {
              if (disableBannerDelete) return;

              if (window.confirm("Remove this section?")) {
                removeSection(index);
              }
            }}
            className={`border px-3 py-1 text-xs font-medium ${
              disableBannerDelete
                ? "cursor-not-allowed border-gray-200 text-gray-400"
                : "border-red-200 text-red-600 hover:bg-red-50"
            }`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* BODY */}
      {open && (
        <div className="p-4">
          {section.type === "banner" && (
            <HeroSectionForm
              section={section}
              onChange={(updated) => updateSection(index, updated)}
            />
          )}

          {section.type === "content" && (
            <ContentSectionForm
              section={section}
              onChange={(updated) => updateSection(index, updated)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SectionCard;
