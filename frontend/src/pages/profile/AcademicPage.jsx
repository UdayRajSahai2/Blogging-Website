import { useEffect, useState, useMemo } from "react";
import { getMyAcademics, deleteAcademic } from "../../api/academic.api";
import { Link } from "react-router-dom";

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
      <i className="fi-rr-book text-lg"></i>
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
          <i className="fi-rr-plus text-xs"></i>
          <span className="hidden sm:inline">Add Academic</span>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-3">
        <div className="relative w-full sm:w-80">
          <i className="fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>

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
          const location = [item.city, item.state, item.country]
            .filter(Boolean)
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
              className="relative py-3 md:py-4 px-3 md:px-5 hover:bg-gray-50 transition"
            >
              {/* ACTIONS */}
              <div className="absolute right-3 top-3 flex items-center gap-3 text-gray-500">
                <Link
                  to={`edit/${item.academic_id}`}
                  className="flex items-center gap-1 hover:text-blue-600 transition"
                  title="Edit"
                >
                  <i className="fi-rr-edit text-sm"></i>
                  <span className="hidden sm:inline text-xs md:text-sm">
                    Edit
                  </span>
                </Link>

                <button
                  onClick={() => handleDelete(item.academic_id)}
                  className="flex items-center gap-1 hover:text-red-600 transition"
                  title="Delete"
                >
                  <i className="fi-rr-trash text-sm"></i>
                  <span className="hidden sm:inline text-xs md:text-sm">
                    Delete
                  </span>
                </button>
              </div>

              {/* CONTENT */}
              <div className="min-w-0 text-xs md:text-sm lg:text-base">
                {/* TITLE ROW */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 font-medium text-gray-900">
                  <span>{item.title}</span>

                  {item.level && (
                    <span className="text-gray-500 font-normal">
                      {item.level}
                    </span>
                  )}

                  {duration && (
                    <span className="text-gray-400 font-normal">
                      {duration}
                    </span>
                  )}

                  {grade && (
                    <span className="flex items-center gap-1 text-gray-400 font-normal">
                      <i className="fi-rr-star text-[11px]"></i>
                      {grade}
                    </span>
                  )}
                </div>

                {/* STATUS BADGES */}
                <StatusBadges item={item} />

                {/* INSTITUTE */}
                <div className="text-gray-700 mt-1 leading-snug">
                  {item.institute_name}

                  {item.university_name && (
                    <span className="text-gray-500">
                      {" "}
                      · {item.university_name}
                    </span>
                  )}
                </div>

                {/* META */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-gray-500 text-xs md:text-sm mt-1">
                  {item.field_of_study && (
                    <span className="flex items-center gap-1">
                      <i className="fi-rr-book text-[11px]"></i>
                      {item.field_of_study}
                    </span>
                  )}

                  {location && (
                    <span className="flex items-center gap-1">
                      <i className="fi-rr-marker text-[11px]"></i>
                      {location}
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                {item.description && (
                  <div className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2">
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
