import React, { useState } from "react";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";

/* ================= EXPERIENCE CARD ================= */
const ExperienceCard = ({ exp, onEdit, onDelete, printMode = false }) => {
  const [expanded, setExpanded] = useState(false);

  const shortText = (text, limit = 120) => {
    if (!text) return "";
    return text.length > limit && !expanded
      ? text.slice(0, limit) + "..."
      : text;
  };
  const formatMonthYear = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };
  const formatLocation = (value) =>
    value
      ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
      : "";
  return (
    <div className="rounded-sm px-1 py-1 bg-white border-b border-gray-200 ">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 text-xs text-gray-700 space-y-1">
          {/* MAIN LINE */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[14px] rounded-lg px-3 py-2 border-l-4 border-sky-600 ">
            {/* PRIMARY */}
            <span className="font-semibold text-gray-700 truncate">
              {exp.designation}
            </span>

            <span className="text-gray-400 hidden sm:inline">•</span>

            <span className="truncate text-gray-700">{exp.employer_name}</span>

            {/* SECONDARY */}
            {exp.industry && (
              <>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="text-gray-700">{exp.industry}</span>
              </>
            )}

            {exp.employment_type && (
              <>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="text-gray-700">{exp.employment_type}</span>
              </>
            )}
            {(exp.city || exp.state || exp.country) && (
              <>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="text-gray-700">
                  {[exp.city, exp.state, exp.country]
                    .filter(Boolean)
                    .map(formatLocation)
                    .join(", ")}
                </span>
              </>
            )}
            <span className="text-gray-400 hidden sm:inline">•</span>
            {/* DATE (slightly emphasized but not primary) */}
            <span className="text-gray-700 ">
              {formatMonthYear(exp.start_date)} —{" "}
              {exp.is_current ? "Present" : formatMonthYear(exp.end_date)}
            </span>

            {/* BADGE */}
            <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[11px] font-medium">
              {exp.custom_profession || exp.profession?.name || "No profession"}
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-2 space-y-2 text-sm text-gray-600 leading-relaxed relative">
            {!printMode && (
              <div className="absolute top-0 right-0 flex items-center gap-2 text-gray-500">
                {onEdit && (
                  <button
                    onClick={() => onEdit(exp)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">Edit</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">Delete</span>
                  </button>
                )}
              </div>
            )}

            {/* CONTENT AREA (avoid overlap with actions) */}
            <div className="pr-0 text-justify">
              {(printMode || expanded) &&
                (exp.roles_responsibilities || exp.achievements) && (
                  <div className="space-y-3">
                    {exp.roles_responsibilities && (
                      <div>
                        <div className="text-[13px] font-medium underline text-gray-900 tracking-wide">
                          Roles & Responsibilities
                        </div>
                        <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                          {exp.roles_responsibilities}
                        </div>
                      </div>
                    )}

                    {exp.roles_responsibilities && exp.achievements && (
                      <div className="border-t border-gray-300 my-3" />
                    )}

                    {exp.achievements && (
                      <div>
                        <div className="text-[13px] font-medium underline text-gray-900 tracking-wide">
                          Achievements
                        </div>
                        <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                          {exp.achievements}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* TOGGLE */}
              {!printMode &&
                (exp.roles_responsibilities || exp.achievements) && (
                  <button
                    onClick={() => setExpanded((p) => !p)}
                    className="mt-2 text-indigo-600 text-xs hover:text-indigo-800 hover:underline"
                  >
                    {expanded ? "Show less" : "Show more"}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= EXPERIENCE LIST ================= */
const ExperienceList = ({
  experiences = [],
  onEdit,
  onDelete,
  printMode = false,
}) => {
  if (!experiences.length) {
    return (
      <div className="text-xs text-gray-400 text-center py-4 border rounded">
        No experience added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {experiences.map((exp) => (
        <ExperienceCard
          key={exp.id}
          exp={exp}
          onEdit={onEdit}
          onDelete={onDelete}
          printMode={printMode}
        />
      ))}
    </div>
  );
};

export default ExperienceList;
