import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../App";
import {
  addAcademic,
  updateAcademic,
  getAcademicById,
  getMyAcademics,
} from "../../../api/academic.api";
import { useNavigate, useParams } from "react-router-dom";
import InputBox from "../../input.component";
import { useRef, userAuth } from "react";
import toast from "react-hot-toast";
const initialState = {
  level: "",
  title: "",
  specialization: "",
  institution: "",
  awarding_body: "",
  start_year: "",
  end_year: "",
  grade_value: "",
  grade_type: "%",
  city: "",
  state: "",
  country: "India",
  description: "",
  is_primary: false,
  is_current: false,
};
const LEVELS = ["School", "ITI", "Diploma", "UG", "PG", "PhD", "PostDoc"];

const LEVEL_TITLES = {
  School: ["Class 10", "Class 12"],
  ITI: ["ITI Electrician", "ITI Fitter", "ITI Welder", "ITI Mechanic"],
  Diploma: [
    "Diploma in Engineering",
    "Diploma in Polytechnic",
    "Diploma in Computer Science",
  ],
  UG: ["B.Tech", "B.E", "B.Sc", "B.Com", "BA", "BBA", "BCA", "MBBS", "LLB"],
  PG: ["M.Tech", "M.E", "M.Sc", "MBA", "MCA", "MA", "LLM"],
  PhD: ["PhD"],
  PostDoc: ["PostDoc"],
};
const SCHOOL_GROUPS = {
  Primary: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
  Secondary: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
  SeniorSecondary: ["Class 11", "Class 12"],
};
const getClassNumber = (title) => {
  const match = title?.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

export default function AcademicForm({ onNext }) {
  const { setUserAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const { academic_id } = useParams();
  const isEditMode = Boolean(academic_id);
  const [addedCount, setAddedCount] = useState(0);
  const [lastAdded, setLastAdded] = useState(null);
  const [customTitle, setCustomTitle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingAcademics, setExistingAcademics] = useState([]);
  const [form, setForm] = useState(initialState);
  const titleOptions = LEVEL_TITLES[form.level] || [];
  const [suggestion, setSuggestion] = useState("");
  const messageRef = useRef(null);
  /* =============================
     LOAD (EDIT MODE)
  ============================= */
  useEffect(() => {
    if (isEditMode) loadAcademic();
  }, [academic_id]);

  const loadAcademic = async () => {
    try {
      const res = await getAcademicById(academic_id);
      const data = res?.data?.data;

      const options = LEVEL_TITLES[data?.level] || [];

      // detect custom title
      if (data?.title && !options.includes(data.title)) {
        setCustomTitle(true);
      }

      setForm({
        level: data?.level || "",
        title: data?.title || "",
        specialization: data?.field_of_study || "",
        institution: data?.institute_name || "",
        awarding_body: data?.university_name || "",
        start_year: data?.start_year || "",
        end_year: data?.end_year || "",
        grade_value: data?.grade_value || "",
        grade_type: data?.grade_type || "%",
        city: data?.city || "",
        state: data?.state || "",
        country: data?.country || "India",
        description: data?.description || "",
        is_primary: data?.is_primary || false,
        is_current: data?.is_current || false,
      });
    } catch {
      setError("Failed to load academic record");
    }
  };

  /* =============================
     HANDLE CHANGE
  ============================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");

    setForm((prev) => {
      let newValue = type === "checkbox" ? checked : value;

      //  FIX QUALIFICATION CASE HERE
      if (name === "title" && customTitle) {
        newValue = value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      } else {
        newValue = value;
      }

      if (name === "level") {
        setCustomTitle(false);
        return { ...prev, level: value, title: "" };
      }

      if (name === "title" && value === "other") {
        setCustomTitle(true);
        return { ...prev, title: "" };
      }

      if (name === "grade_type") {
        return { ...prev, grade_type: newValue, grade_value: "" };
      }

      if (name === "is_current") {
        return {
          ...prev,
          is_current: checked,
          end_year: checked ? "" : prev.end_year,
        };
      }

      return { ...prev, [name]: newValue };
    });
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (form.start_year && form.end_year) {
        if (Number(form.start_year) > Number(form.end_year)) {
          toast.error("Start year must be before end year");
          setLoading(false);
          return;
        }
      }
      // DUPLICATE CHECK
      if (!isEditMode) {
        const alreadyExists = existingAcademics.some(
          (edu) =>
            edu.level === form.level &&
            edu.title?.toLowerCase().trim() ===
              form.title?.toLowerCase().trim(),
        );

        if (alreadyExists) {
          setError("⚠️ This education already added.");
          toast.error("This education already added ⚠️");
          setLoading(false);
          return;
        }
      }

      // PAYLOAD
      const payload = {
        level: form.level,
        title: form.title,
        institute_name: form.institution,
        university_name: form.awarding_body,
        field_of_study: form.specialization,
        start_year: form.start_year ? Number(form.start_year) : null,
        end_year: form.is_current
          ? null
          : form.end_year
            ? Number(form.end_year)
            : null,
        is_current: form.is_current || false,
        grade_value: form.grade_value || null,
        grade_type: form.grade_type,
        city: form.city,
        state: form.state,
        country: form.country,
        description: form.description,
        is_primary: form.is_primary,
      };

      let responseData = null;

      // EDIT MODE
      if (isEditMode) {
        const res = await updateAcademic(academic_id, payload);
        responseData = res?.data?.data;

        toast.success(`${form.title} updated successfully ✏️`);

        setLastAdded({
          level: form.level,
          title: form.title,
        });
      }

      // ADD MODE
      else {
        const res = await addAcademic(payload);
        responseData = res?.data?.data;
        toast.success(`${form.title} added successfully 🎓`);
        setExistingAcademics((prev) => [
          ...prev,
          { level: form.level, title: form.title },
        ]);

        //  suggestion based on GLOBAL user type
        if (
          responseData?.missingPrevious &&
          userAuth?.user_type === "student" &&
          addedCount < 1
        ) {
          setError("👉 You may want to add your previous class.");
        }

        setLastAdded({
          level: form.level,
          title: form.title,
        });
      }

      // scroll
      setTimeout(() => {
        messageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      // ONBOARDING FLOW
      if (onNext && !isEditMode) {
        const isSubmit = e.nativeEvent.submitter?.type === "button";

        if (isSubmit) {
          onNext();
          return;
        }

        setAddedCount((prev) => prev + 1);
        setForm(initialState);
        setCustomTitle(false);
        return;
      }

      // DASHBOARD FLOW
      if (!onNext) {
        navigate("/dashboard/academics");
      }
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setError(err?.response?.data?.error || "Failed to save academic record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadAcademics = async () => {
    try {
      const res = await getMyAcademics();
      setExistingAcademics(res?.data?.data || []);
    } catch {
      setExistingAcademics([]);
    }
  };

  useEffect(() => {
    if (form.level === "School") {
      const num = getClassNumber(form.title);
      if (num && num > 1) {
        setSuggestion(`Next: Add Class ${num - 1}`);
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
  }, [form.title, form.level]);

  useEffect(() => {
    if (userAuth?.user_type === "student" && addedCount >= 2) {
      const btn = document.getElementById("submit-btn");
      if (btn) {
        btn.classList.add("ring-2", "ring-green-500");
      }
    }
  }, [addedCount, userAuth?.user_type]);
  /* =============================
     UI
  ============================= */
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-2">
      <h1 className="text-lg font-semibold mb-2">
        {isEditMode ? "Edit Academic Record" : "Add Academic Record"}
      </h1>
      {/* INFO BOX */}
      {onNext && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-md px-4 py-3 mb-3 text-sm">
          {userAuth?.user_type === "student" ? (
            <>
              🎓<strong>Student:</strong> Start with your{" "}
              <strong>current class</strong>, then add your{" "}
              <strong>previous education</strong> step by step.
            </>
          ) : userAuth?.user_type === "professional" ? (
            <>
              💼 <strong>Professional:</strong> Add your{" "}
              <strong>highest qualification</strong>. You can add earlier
              education later.
            </>
          ) : (
            <>📘 Add your education details to continue.</>
          )}
        </div>
      )}
      {(error || lastAdded) && (
        <div
          ref={messageRef}
          className="bg-green-50 border border-green-200 text-green-900 p-3 rounded-md text-sm mb-2 space-y-1 scroll-mt-40"
        >
          {/* ⚠️ WARNING */}
          {error && <p className="text-orange-600 font-medium">⚠️ {error}</p>}

          {/* ✅ SUCCESS */}
          {!error && lastAdded && (
            <>
              <p>
                {isEditMode ? "✏️ Updated" : "🎓 Added"}{" "}
                <strong>{lastAdded.title}</strong>
                {userAuth?.user_type === "student" && (
                  <>
                    {addedCount === 1 && " → add previous class"}
                    {addedCount >= 2 &&
                      " → add more or click Submit to complete your profile"}
                  </>
                )}
              </p>

              {existingAcademics.length > 0 && (
                <div className="text-xs text-gray-600">
                  {" "}
                  {/*  FIX */}
                  📚 Added:{" "}
                  {existingAcademics
                    .map((edu) =>
                      edu.title
                        ?.toLowerCase()
                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                    )
                    .join(", ")}
                </div>
              )}
            </>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* LEVEL + TITLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* LEVEL */}
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Education Level</label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
              className="h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select level</option>
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <span className="text-[11px] text-gray-400 mt-1">
              Choose your education category
            </span>
          </div>

          {/* TITLE */}
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Qualification</label>

            {/* If level not selected */}
            {!form.level && (
              <div className="h-10 px-3 border border-dashed border-gray-300 rounded-md text-sm text-gray-400 flex items-center">
                Select level first
              </div>
            )}

            {/* Dropdown */}
            {form.level && !customTitle && (
              <select
                name="title"
                value={form.title}
                onChange={handleChange}
                className="h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select qualification</option>

                {/* SCHOOL GROUPS */}
                {form.level === "School" &&
                  Object.entries(SCHOOL_GROUPS).map(([group, classes]) => (
                    <optgroup key={group} label={group}>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </optgroup>
                  ))}

                {/* OTHER LEVELS */}
                {form.level !== "School" &&
                  titleOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}

                <option value="other">Other (type manually)</option>
              </select>
            )}

            {/* Custom input */}
            {form.level && (customTitle || form.title === "other") && (
              <div className="flex gap-2">
                <InputBox
                  name="title"
                  placeholder="e.g., Class 8"
                  value={form.title}
                  onChange={(e) => {
                    let val = e.target.value;

                    // 🎓 auto-fix input
                    const match = val.match(/\d+/);
                    if (match) {
                      const num = parseInt(match[0]);
                      if (num >= 1 && num <= 12) {
                        val = `Class ${num}`;
                      }
                    }

                    handleChange({
                      target: { name: "title", value: val },
                    });
                  }}
                  required
                />
              </div>
            )}

            {/* Helper */}
            {form.level && !customTitle && (
              <span className="text-[11px] text-gray-400 mt-1">
                Can't find your course? Select "Other"
              </span>
            )}

            {form.level === "School" && form.title && (
              <p className="text-[11px] text-gray-500 mt-1">
                📚{" "}
                {Object.keys(SCHOOL_GROUPS).find((group) =>
                  SCHOOL_GROUPS[group].includes(form.title),
                )}
              </p>
            )}
            {/* 💡 SUGGESTION */}
            {suggestion && (
              <p className="text-[11px] text-blue-500 mt-1">💡 {suggestion}</p>
            )}
          </div>
        </div>

        {/* Field + Institution + University */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium mb-1">Field of Study</label>
            <InputBox
              name="specialization"
              placeholder="Computer Science"
              value={form.specialization}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1">Institute</label>
            <InputBox
              name="institution"
              placeholder="Institute Name"
              value={form.institution}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1">
              University / Board
            </label>
            <InputBox
              name="awarding_body"
              placeholder="University / Board"
              value={form.awarding_body}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Years + Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium mb-1">Start Year</label>
            <InputBox
              name="start_year"
              type="number"
              placeholder="2018"
              value={form.start_year}
              onChange={handleChange}
            />
          </div>
          {/* CURRENTLY STUDYING */}
          <div>
            <div className="flex items-center justify-between mb-0">
              <label className="text-xs font-medium">Completion Year</label>

              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={form.is_current || false}
                  onChange={handleChange}
                />
                <span className="text-[11px] text-gray-500">Present</span>
              </div>
            </div>

            <InputBox
              name="end_year"
              type={form.is_current ? "text" : "number"}
              placeholder={form.is_current ? "Present" : "2022"}
              value={form.end_year}
              onChange={handleChange}
              disabled={form.is_current}
            />
          </div>

          {/* Score */}
          <div>
            <label className="text-xs font-medium mb-1">Marks</label>

            <div className="flex border border-gray-300 rounded-md overflow-hidden text-sm focus-within:ring-2 focus-within:ring-blue-500">
              {form.grade_type === "grade" ? (
                <select
                  name="grade_value"
                  value={form.grade_value || ""}
                  onChange={handleChange}
                  className="flex-1 px-2 py-2 outline-none"
                >
                  <option value="">Grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                </select>
              ) : (
                <input
                  type="number"
                  name="grade_value"
                  value={form.grade_value || ""}
                  onChange={handleChange}
                  placeholder={form.grade_type === "%" ? "85" : "8.5"}
                  className="flex-1 px-2 py-2 outline-none"
                />
              )}

              <select
                name="grade_type"
                value={form.grade_type}
                onChange={handleChange}
                className="px-2 border-l bg-gray-50 outline-none"
              >
                <option value="%">%</option>
                <option value="cgpa">CGPA</option>
                <option value="grade">Grade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">City</label>
            <InputBox
              name="city"
              placeholder="e.g., Lucknow"
              value={form.city}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">State</label>
            <InputBox
              name="state"
              placeholder="e.g., Uttar Pradesh"
              value={form.state}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Country</label>
            <InputBox
              name="country"
              placeholder="e.g., India"
              value={form.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add relevant details about your course, achievements, or activities"
          />
        </div>

        {/* Primary */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="is_primary"
            checked={form.is_primary}
            onChange={handleChange}
            className="mt-1"
          />
          <div className="flex flex-col">
            <label className="text-sm font-medium">
              Mark as highest qualification
            </label>
            <span className="text-xs text-gray-500">
              This will be shown first on your profile
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t items-center">
          {!onNext && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              Cancel
            </button>
          )}

          {/* SHOW SUBMIT AFTER AT LEAST ONE ENTRY */}
          {onNext && addedCount > 0 && (
            <button
              type="button"
              onClick={() => onNext()}
              className={`px-4 py-2 bg-green-600 text-white rounded-lg text-sm transition
      ${userAuth?.user_type && addedCount >= 2 ? "ring-2 ring-green-500" : ""}
    `}
            >
              Academics details completed
            </button>
          )}

          {/*  MAIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            {loading
              ? "Saving..."
              : onNext
                ? addedCount > 0
                  ? "Add More"
                  : "Add Education"
                : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
