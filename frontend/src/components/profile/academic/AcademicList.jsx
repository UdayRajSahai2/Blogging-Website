import { useState } from "react";

const AcademicCard = ({ item, isOwner }) => {
  const [expanded, setExpanded] = useState(false);
  const showInstitute =
    item.institute_name &&
    item.institute_name.toLowerCase() !== item.title?.toLowerCase();
  // Capitalize first letter of each word
  const toTitleCase = (text = "") =>
    text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Handle abbreviations like b.sc → B.Sc
  const formatAbbreviation = (text = "") => {
    if (!text) return "";

    return text
      .split(" ")
      .map((word) => {
        // If contains dot → treat as abbreviation
        if (word.includes(".")) {
          return word
            .split(".")
            .map((part) => part.toUpperCase())
            .join(".");
        }
        return word.toUpperCase(); // short words → uppercase
      })
      .join(" ");
  };

  // Smart formatter (auto detect)
  const formatText = (text = "") => {
    if (!text) return "";

    const trimmed = text.trim();

    //  If already dotted like b.e.e → B.E.E
    if (trimmed.includes(".")) {
      return trimmed
        .split(".")
        .filter(Boolean)
        .map((part) => part.toUpperCase())
        .join(".");
    }

    const clean = trimmed.toLowerCase();

    //  Degree mapping (only valid degree formats)
    const degreeMap = {
      bsc: "B.Sc",
      btech: "B.Tech",
      be: "B.E",
      mtech: "M.Tech",
      msc: "M.Sc",
      ba: "B.A",
      ma: "M.A",
    };

    if (degreeMap[clean]) return degreeMap[clean];

    const words = clean.split(" ");

    //  Abbreviations (NO dots)
    if (words.length === 1 && clean.length <= 5) {
      return clean.toUpperCase();
    }

    //  Normal text
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const location = [item.city, item.state, item.country]
    .filter(Boolean)
    .map(toTitleCase)
    .join(", ");

  const duration = item.start_year
    ? `${item.start_year} – ${item.is_current ? "Present" : item.end_year}`
    : item.is_current
      ? "Present"
      : item.end_year;

  const hasGrade = item.grade_value !== null && item.grade_value !== undefined;

  const grade = hasGrade
    ? item.grade_type === "%"
      ? `${item.grade_value}%`
      : item.grade_type === "cgpa"
        ? `${item.grade_value} CGPA`
        : item.grade_value
    : null;

  // Description truncate
  const shortText = (text, limit = 120) => {
    if (!text) return "";
    return text.length > limit && !expanded
      ? text.slice(0, limit) + "..."
      : text;
  };
  const showUniversity =
    item.university_name &&
    item.university_name.toLowerCase() !== item.institute_name?.toLowerCase();
  return (
    <div className="rounded-lg px-3 py-2 bg-white border-l-4 border-indigo-500">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
        {/* TITLE */}
        <span className="font-semibold text-gray-800">
          {formatText(item.title)}
        </span>

        {showInstitute && (
          <>
            <span className="text-gray-400">•</span>
            <span>{formatText(item.institute_name)}</span>
          </>
        )}

        {showUniversity && (
          <>
            <span className="text-gray-400">•</span>
            <span>{formatText(item.university_name)}</span>
          </>
        )}
        {location && (
          <>
            <span className="text-gray-400">•</span>
            <span>{location}</span>
          </>
        )}

        {duration && (
          <>
            <span className="text-gray-400">•</span>
            <span>{duration}</span>
          </>
        )}

        {isOwner && grade && (
          <>
            <span className="text-gray-400">•</span>
            <span>Grade: {grade}</span>
          </>
        )}
      </div>

      {/*  DESCRIPTION WITH TOGGLE */}
      {item.description && (
        <div className="mt-1 text-gray-500 text-xs">
          {shortText(item.description)}

          {item.description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-indigo-600 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 2️ AcademicList (UPDATED)
const AcademicList = ({ academics = [], isOwner }) => {
  if (!academics.length) {
    return (
      <div className="text-xs text-gray-400 text-center py-4 border rounded">
        No academic records yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {academics.map((item) => (
        <AcademicCard
          key={item.academic_id}
          item={item}
          isOwner={isOwner} //  important
        />
      ))}
    </div>
  );
};

export default AcademicList;
