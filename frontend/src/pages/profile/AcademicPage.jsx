import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import BookOpenIcon from "@heroicons/react/24/solid/BookOpenIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import MapPinIcon from "@heroicons/react/24/solid/MapPinIcon";
import CalendarIcon from "@heroicons/react/24/solid/CalendarIcon";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";

import { getMyAcademics, deleteAcademic } from "../../api/academic.api";
export default function AcademicPage() {
  const [academics, setAcademics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ======================================================
     Fetch Academics
  ====================================================== */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getMyAcademics();
      const data = res?.data?.data || [];

      setAcademics(data);
    } catch (err) {
      console.error("Failed to fetch academics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ======================================================
     Search Filter
  ====================================================== */

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return academics.filter((item) =>
      `${item.title} ${item.institute_name} ${item.level}`
        .toLowerCase()
        .includes(term),
    );
  }, [search, academics]);

  /* ======================================================
     Delete
  ====================================================== */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this academic record?")) return;

    try {
      await deleteAcademic(id);

      setAcademics((prev) => prev.filter((a) => a.academic_id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete academic record");
    }
  };

  /* ======================================================
     Helpers
  ====================================================== */

  const formatGrade = (item) => {
    if (!item.grade_value) return null;

    if (item.grade_type === "%") return `${item.grade_value}%`;
    if (item.grade_type === "cgpa") return `${item.grade_value} CGPA`;
    if (item.grade_type === "grade") return item.grade_value;

    return item.grade_value;
  };

  const LoadingState = () => (
    <div className="text-center py-10 text-gray-500">
      Loading academic records...
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-6 text-sm text-gray-400 flex flex-col items-center gap-1">
      <BookOpenIcon className="w-5 h-5" />
      No academic records yet.
    </div>
  );

  const StatusBadges = ({ item }) => (
    <div className="flex flex-wrap gap-2 mt-1">
      {item.is_primary && (
        <span className="text-[10px] md:text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
          Primary
        </span>
      )}

      {item.is_verified && (
        <span className="text-[10px] md:text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
          Verified
        </span>
      )}
    </div>
  );
  const formatText = (text = "") => {
    if (!text) return "";

    const trimmed = text.trim();

    // dotted input → B.E.E
    if (trimmed.includes(".")) {
      return trimmed
        .split(".")
        .filter(Boolean)
        .map((part) => part.toUpperCase())
        .join(".");
    }

    const clean = trimmed.toLowerCase();

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

    // abbreviation (NO dots)
    if (words.length === 1 && clean.length <= 5) {
      return clean.toUpperCase();
    }

    // normal text
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };
  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-6xl mx-auto w-full px-2">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Academic Records
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            Manage your educational qualifications
          </p>
        </div>

        <Link
          to="add"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Add Academic</span>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search academics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white divide-y border rounded-lg overflow-hidden">
        {loading && <LoadingState />}
        {!loading && filtered.length === 0 && <EmptyState />}
        {filtered.map((item) => {
          const toTitleCase = (text = "") =>
            text
              .toLowerCase()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

          const location = [item.city, item.state, item.country]
            .filter(Boolean)
            .map(toTitleCase)
            .join(", ");

          const duration = item.start_year
            ? `${item.start_year} – ${item.is_current ? "Present" : item.end_year}`
            : item.is_current
              ? "Present"
              : item.end_year;

          const grade = formatGrade(item);

          return (
            <div
              key={item.academic_id}
              className="relative py-4 px-4 md:px-5 hover:bg-gray-50/80 transition"
            >
              {/* ACTIONS */}
              <div className="absolute right-3 top-3 flex items-center gap-2 text-gray-700">
                <Link
                  to={`edit/${item.academic_id}`}
                  className="flex items-center gap-1 text-blue-700 hover:text-blue-900 transition"
                  title="Edit"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs md:text-sm font-medium">
                    Edit
                  </span>
                </Link>

                <button
                  onClick={() => handleDelete(item.academic_id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs md:text-sm font-medium">
                    Delete
                  </span>
                </button>
              </div>

              {/* CONTENT */}
              <div className="min-w-0 text-sm lg:text-base text-gray-900 font-medium leading-snug">
                {/* TITLE ROW */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 font-medium text-gray-900">
                  <span>{formatText(item.title)}</span>

                  {item.level && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600 font-medium">
                        {formatText(item.level)}
                      </span>
                    </>
                  )}

                  {duration && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {duration}
                      </span>
                    </>
                  )}

                  {grade && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <StarIcon className="w-3.5 h-3.5" />
                        {grade}
                      </span>
                    </>
                  )}
                </div>

                {/* STATUS BADGES */}
                <StatusBadges item={item} />

                {/* INSTITUTE + UNIVERSITY */}
                <div className="mt-1 text-gray-700 text-sm font-medium">
                  {formatText(item.institute_name)}

                  {item.university_name && (
                    <span className="text-gray-500 font-normal">
                      {" "}
                      · {formatText(item.university_name)}
                    </span>
                  )}
                </div>

                {/* META */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-gray-600 text-xs md:text-sm mt-1">
                  {item.field_of_study && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <BookOpenIcon className="w-3.5 h-3.5" />
                      {formatText(item.field_of_study)}
                    </span>
                  )}

                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {location}
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                {item.description && (
                  <div className="text-gray-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
