// frontend/src/components/admin/pages/SectionBuilder.jsx

import SectionCard from "./SectionCard";

const buttonClass =
  "border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50";

const SectionBuilder = ({ sections, setSections }) => {
  const hasBanner = (sections || []).some(
    (section) => section.type === "banner",
  );

  const hasContent = (sections || []).some(
    (section) => section.type === "content",
  );
  const addSection = (type) => {
    // Prevent duplicate banner
    if (type === "banner" && hasBanner) {
      return;
    }

    // Prevent content before banner
    if (type === "content" && !hasBanner) {
      return;
    }

    // Prevent duplicate content
    if (type === "content" && hasContent) {
      return;
    }

    let section = {
      type,
    };

    // BANNER SECTION
    if (type === "banner") {
      section = {
        type: "banner",
        title: "",
        description: "",
        image: "",
      };
    }

    // CONTENT SECTION
    if (type === "content") {
      section = {
        type: "content",
        heading: "",
        image: "",
        content: "",
      };
    }

    setSections([...(sections || []), section]);
  };

  const updateSection = (index, updatedSection) => {
    const updatedSections = [...(sections || [])];

    updatedSections[index] = updatedSection;

    setSections(updatedSections);
  };

  const removeSection = (index) => {
    const sectionToRemove = sections[index];

    const hasContent = sections.some((section) => section.type === "content");

    // Prevent deleting banner if content exists
    if (sectionToRemove.type === "banner" && hasContent) {
      return;
    }

    const updatedSections = sections.filter((_, i) => i !== index);

    setSections(updatedSections);
  };

  return (
    <div className="space-y-4">
      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {/* BANNER BUTTON */}
        <button
          type="button"
          onClick={() => addSection("banner")}
          disabled={hasBanner}
          className={`${buttonClass} ${
            hasBanner ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          + Banner Section
        </button>

        {/* CONTENT BUTTON */}
        <button
          type="button"
          onClick={() => addSection("content")}
          disabled={!hasBanner || hasContent}
          className={`${buttonClass} ${
            !hasBanner || hasContent ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          + Content Section
        </button>
      </div>

      {/* SECTION LIST */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No content sections added yet
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionCard
              key={index}
              section={section}
              index={index}
              sections={sections}
              updateSection={updateSection}
              removeSection={removeSection}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SectionBuilder;
