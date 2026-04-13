import { useState } from "react";

const AcademicCard = ({ item, isOwner }) => {
  const [expanded, setExpanded] = useState(false);

  const location = [item.city, item.state, item.country]
    .filter(Boolean)
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

  return (
    <div className="rounded-lg px-3 py-2 bg-white border-l-4 border-indigo-500">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
        {/* TITLE */}
        <span className="font-semibold text-gray-800">
          {item.title}
          {item.level && (
            <span className="text-gray-500 font-normal ml-1">
              ({item.level})
            </span>
          )}
        </span>

        {item.institute_name && (
          <>
            <span className="text-gray-400">•</span>
            <span>{item.institute_name}</span>
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

// 2️⃣ AcademicList (UPDATED)
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
