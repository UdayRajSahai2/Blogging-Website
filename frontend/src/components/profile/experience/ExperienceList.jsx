import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

/* ================= EXPERIENCE CARD ================= */
const ExperienceCard = ({ exp, onEdit, onDelete }) => {
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

  return (
    <div className="rounded-lg px-3 py-2 bg-white border-l-4 border-emerald-500">
      <div className="flex items-start justify-between gap-3">
        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 text-xs text-gray-600">
          {/* 🔹 MAIN HORIZONTAL LINE */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-gray-800 truncate">
              {exp.designation}
            </span>

            <span className="text-gray-400">•</span>

            <span className="truncate">{exp.employer_name}</span>

            {exp.industry && (
              <>
                <span className="text-gray-400">•</span>
                <span>{exp.industry}</span>
              </>
            )}

            {exp.employment_type && (
              <>
                <span className="text-gray-400">•</span>
                <span>{exp.employment_type}</span>
              </>
            )}

            {(exp.city || exp.state) && (
              <>
                <span className="text-gray-400">•</span>
                <span>{[exp.city, exp.state].filter(Boolean).join(", ")}</span>
              </>
            )}

            {exp.country && (
              <>
                <span className="text-gray-400">•</span>
                <span>{exp.country}</span>
              </>
            )}

            <span className="text-gray-400">•</span>

            <span>
              {formatMonthYear(exp.start_date)} —{" "}
              {exp.is_current ? "Present" : formatMonthYear(exp.end_date)}
            </span>

            {/* PROFESSION */}
            <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px]">
              {exp.custom_profession || exp.profession?.name || "No profession"}
            </span>

            {/* STATUS */}
            {/* <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                exp.verification_status === "verified"
                  ? "bg-green-100 text-green-700"
                  : exp.verification_status === "rejected"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {exp.verification_status || "pending"}
            </span> */}
          </div>

          {/* 🔹 ROLE + CONTRIBUTIONS */}
          {(exp.roles_responsibilities || exp.achievements) && (
            <div className="mt-1 text-gray-500 space-y-1">
              {exp.roles_responsibilities && (
                <div>
                  <span className="font-medium text-gray-700">Role:</span>{" "}
                  {shortText(exp.roles_responsibilities, 100)}
                </div>
              )}

              {exp.achievements && (
                <div>
                  <span className="font-medium text-gray-700">
                    Key Contributions:
                  </span>{" "}
                  {shortText(exp.achievements, 100)}
                </div>
              )}

              {/* EXPAND BUTTON */}
              {(exp.roles_responsibilities?.length > 100 ||
                exp.achievements?.length > 100) && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="text-blue-600 text-[11px]"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {/* 🔹 DOCUMENT */}
          {exp.experience_document_url && (
            <div className="mt-1">
              <a
                href={exp.experience_document_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-500 hover:underline"
              >
                View document
              </a>
            </div>
          )}
        </div>

        {/* 🔹 ACTIONS */}
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(exp)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(exp.id)}
              className="p-1 hover:bg-red-50 rounded"
            >
              <TrashIcon className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= EXPERIENCE LIST ================= */
const ExperienceList = ({ experiences = [], onEdit, onDelete }) => {
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
        />
      ))}
    </div>
  );
};

export default ExperienceList;
