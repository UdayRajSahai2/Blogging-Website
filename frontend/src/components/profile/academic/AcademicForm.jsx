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
import LocationDropdown from "../../../common/LocationDropdown";
import {
  LightBulbIcon,
  BookOpenIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
  country_code: "",
  state_code: "",
  district_code: "",
  district: "",
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

const LEVEL_UI_CONFIG = {
  School: {
    specializationLabel: "Stream",
    specializationPlaceholder: "e.g. Science, Commerce, Arts",
    institutionLabel: "School Name",
    institutionPlaceholder: "Enter school name",
    awardingLabel: "Board",
    awardingPlaceholder: "e.g. CBSE, ICSE, State Board",
    showSpecialization: false, // Show only for Class 11 & 12
    showInstitution: true,
    showAwarding: true,
    showMarks: true,
  },

  ITI: {
    specializationLabel: "Trade",
    specializationPlaceholder: "e.g. Electrician, Fitter, Welder",
    institutionLabel: "ITI Name",
    institutionPlaceholder: "Enter ITI name",
    awardingLabel: "Board / Authority",
    awardingPlaceholder: "Enter board or authority",
    showSpecialization: true,
    showInstitution: true,
    showAwarding: true,
    showMarks: true,
  },

  Diploma: {
    specializationLabel: "Branch / Course",
    specializationPlaceholder: "Enter branch or course",
    institutionLabel: "Institute Name",
    institutionPlaceholder: "Enter institute name",
    awardingLabel: "Board / University",
    awardingPlaceholder: "Enter board or university",
    showSpecialization: true,
    showInstitution: true,
    showAwarding: true,
    showMarks: true,
  },

  UG: {
    specializationLabel: "Specialization",
    specializationPlaceholder: "Enter specialization",
    institutionLabel: "College / Institute",
    institutionPlaceholder: "Enter college or institute name",
    awardingLabel: "University",
    awardingPlaceholder: "Enter university name",
    showSpecialization: true,
    showInstitution: true,
    showAwarding: true,
    showMarks: true,
  },

  PG: {
    specializationLabel: "Specialization",
    specializationPlaceholder: "Enter specialization",
    institutionLabel: "College / Institute",
    institutionPlaceholder: "Enter college or institute name",
    awardingLabel: "University",
    awardingPlaceholder: "Enter university name",
    showSpecialization: true,
    showInstitution: true,
    showAwarding: true,
    showMarks: true,
  },

  PhD: {
    specializationLabel: "Research Area",
    specializationPlaceholder: "Enter research area",
    institutionLabel: "University / Institute",
    institutionPlaceholder: "Enter university or institute name",
    awardingLabel: "Awarding University",
    awardingPlaceholder: "Enter awarding university",
    showSpecialization: true,
    showInstitution: true,
    showAwarding: true,
    showMarks: false,
  },

  PostDoc: {
    specializationLabel: "Research Area",
    specializationPlaceholder: "Enter research area",
    institutionLabel: "Host Institution",
    institutionPlaceholder: "Enter institution name",
    awardingLabel: "Organization",
    awardingPlaceholder: "Enter organization name",
    showSpecialization: true,
    showInstitution: true,
    showAwarding: true,
    showMarks: false,
  },
};

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1950 + 1 },
  (_, i) => currentYear - i,
);

export default function AcademicForm({ onNext }) {
  const { setUserAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const { academic_id } = useParams();
  const isEditMode = Boolean(academic_id);

  const [lastAdded, setLastAdded] = useState(null);
  const [customTitle, setCustomTitle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingAcademics, setExistingAcademics] = useState([]);
  const [hasExistingEducation, setHasExistingEducation] = useState(false);
  const academicCount = existingAcademics.length;
  const [form, setForm] = useState(initialState);
  const titleOptions = LEVEL_TITLES[form.level] || [];
  const [suggestion, setSuggestion] = useState("");
  const messageRef = useRef(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const ui = LEVEL_UI_CONFIG[form.level] || LEVEL_UI_CONFIG.UG;
  const showSchoolStream =
    form.level === "School" && ["Class 11", "Class 12"].includes(form.title);

  const isFormValid =
    form.level &&
    form.title &&
    form.institution &&
    form.start_year &&
    (form.is_current || form.end_year) &&
    form.country &&
    form.state &&
    form.district &&
    (form.level !== "School" || form.awarding_body);

  const canCompleteAcademic = () => {
    if (existingAcademics.length === 0) return false;

    // Find the highest school class added
    const schoolRecords = existingAcademics.filter(
      (edu) => edu.level === "School",
    );

    if (schoolRecords.length === 0) {
      // UG, Diploma, ITI, etc.
      return true;
    }

    const classNumbers = schoolRecords
      .map((edu) => getClassNumber(edu.title))
      .filter(Boolean);

    const highestClass = Math.max(...classNumbers);

    // Class 1 doesn't need a previous class
    if (highestClass === 1) return true;

    // Previous class must exist
    return classNumbers.includes(highestClass - 1);
  };

  const isAcademicComplete = canCompleteAcademic();

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

      let options = [];

      if (data?.level === "School") {
        options = Object.values(SCHOOL_GROUPS).flat();
      } else {
        options = LEVEL_TITLES[data?.level] || [];
      }

      const isPredefined = options.some(
        (option) =>
          option.trim().toLowerCase() === data?.title?.trim().toLowerCase(),
      );

      setCustomTitle(!isPredefined);

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

        country: data?.country || "India",
        state: data?.state || "",
        district: data?.city || "",

        country_code: data?.country_code || "",
        state_code: data?.state_code || "",
        district_code: data?.district_code || "",

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
      // Handle all checkboxes
      if (type === "checkbox") {
        if (name === "is_current") {
          return {
            ...prev,
            is_current: checked,
            end_year: checked ? "" : prev.end_year,
          };
        }

        return {
          ...prev,
          [name]: checked,
        };
      }

      let newValue = value;

      if (name === "title" && customTitle) {
        newValue = value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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
        return { ...prev, grade_type: value, grade_value: "" };
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/location/countries"); // adjust API
      const data = await res.json();
      setCountries(data || []);
    } catch {
      setCountries([]);
    }
  };

  const fetchStates = async (country_code, type) => {
    try {
      const res = await fetch(`/api/location/states/${country_code}`);
      const data = await res.json();
      setStates(data || []);
    } catch {
      setStates([]);
    }
  };

  const fetchDistricts = async (state_code, type) => {
    try {
      const res = await fetch(`/api/location/districts/${state_code}`);
      const data = await res.json();
      setDistricts(data || []);
    } catch {
      setDistricts([]);
    }
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
          setError(" This education already added.");
          toast.error("This education already added ⚠️");
          setLoading(false);
          return;
        }
      }

      // Validate custom qualification
      if (customTitle) {
        const title = form.title.trim();

        const regex = /^[A-Za-z][A-Za-z0-9 .,&()/-]{1,49}$/;

        if (!regex.test(title)) {
          toast.error("Please enter a valid qualification.");
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

        city: form.district,
        state: form.state,
        country: form.country,
        country_code: form.country_code,
        state_code: form.state_code,
        district_code: form.district_code,

        description: form.description,
        is_primary: form.is_primary,
      };

      let responseData = null;

      // EDIT MODE
      if (isEditMode) {
        const res = await updateAcademic(academic_id, payload);
        responseData = res?.data?.data;

        toast.success(`${form.title} updated successfully`);

        setLastAdded({
          level: form.level,
          title: form.title,
        });
      }

      // ADD MODE
      else {
        const res = await addAcademic(payload);
        responseData = res?.data?.data;
        toast.success(`${form.title} added successfully`);
        setExistingAcademics((prev) => [
          ...prev,
          { level: form.level, title: form.title },
        ]);

        //  suggestion based on GLOBAL user type
        if (
          responseData?.missingPrevious &&
          userAuth?.user_type === "student" &&
          existingAcademics.length < 1
        ) {
          setError(" You may want to add your previous class.");
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
      const academics = res?.data?.data || [];

      setExistingAcademics(academics);

      // Only true if education existed BEFORE this session
      if (academics.length > 0) {
        setHasExistingEducation(true);
      }
    } catch {
      setExistingAcademics([]);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setSuggestion("");
      return;
    }

    if (form.level !== "School") {
      setSuggestion("");
      return;
    }

    const num = getClassNumber(form.title);

    if (!num || num <= 1) {
      setSuggestion("");
      return;
    }

    const previousClass = `Class ${num - 1}`;

    const hasPreviousClass = existingAcademics.some(
      (edu) =>
        edu.level === "School" &&
        edu.title?.trim().toLowerCase() === previousClass.toLowerCase(),
    );

    if (!hasPreviousClass) {
      setSuggestion(
        `Please add your previous class (${previousClass}) after saving ${form.title}.`,
      );
    } else {
      setSuggestion("");
    }
  }, [form.level, form.title, existingAcademics, isEditMode]);

  const updateAddress = (type, key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const mode = isEditMode ? "edit" : onNext ? "onboarding" : "add";

  let buttonText = "Add Education";

  if (loading) {
    buttonText = "Saving...";
  } else if (mode === "edit") {
    buttonText = "Save Changes";
  } else if (mode === "onboarding") {
    buttonText =
      form.level === "School" ? "Add Previous Class" : "Add Previous Education";
  } else {
    buttonText =
      existingAcademics.length === 0
        ? "Add Education"
        : "Add Another Education";
  }

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (userAuth?.user_type === "student" && existingAcademics.length >= 2) {
      const btn = document.getElementById("submit-btn");
      if (btn) {
        btn.classList.add("ring-2", "ring-green-500");
      }
    }
  }, [existingAcademics.length, userAuth?.user_type]);

  /* =============================
     UI
  ============================= */
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-2">
      <h1 className="text-lg font-semibold mb-2">
        {isEditMode ? "Edit Academic Record" : "Add Academic Record"}
      </h1>

      {/* INFO BOX */}
      {onNext &&
        (hasExistingEducation ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-3 mb-3 text-sm">
            🎓 <strong>Education already added.</strong> You can add more
            qualifications or click <strong>Continue</strong>.
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-md px-4 py-3 mb-3 text-sm">
            {userAuth?.user_type === "student" ? (
              <>
                🎓 <strong>Student:</strong> Start with your{" "}
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
              <>Add your education details to continue.</>
            )}
          </div>
        ))}
      {(error || lastAdded) && (
        <div
          ref={messageRef}
          className="bg-green-50 border border-green-200 text-green-900 p-3 rounded-md text-sm mb-2 space-y-1 scroll-mt-40"
        >
          {/*  WARNING */}
          {error && (
            <div className="flex items-start gap-2 text-orange-600 font-medium">
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* SUCCESS */}
          {!error && lastAdded && (
            <>
              <p>
                {isEditMode ? " Updated" : " Added"}{" "}
                <strong>{lastAdded.title}</strong>
                {userAuth?.user_type === "student" && (
                  <>
                    {existingAcademics.length === 1 && " → add previous class"}
                    {existingAcademics.length >= 2 &&
                      " → add more or click Submit to complete your profile"}
                  </>
                )}
              </p>

              {existingAcademics.length > 0 && (
                <div className="flex items-center gap-1 text-gray-600">
                  <BookOpenIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>
                    <strong>Education Added:</strong>{" "}
                    {existingAcademics
                      .map((edu) =>
                        edu.title
                          ?.toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase()),
                      )
                      .join(", ")}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {onNext &&
        !isEditMode &&
        !isAcademicComplete &&
        existingAcademics.some((edu) => edu.level === "School") && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md px-4 py-3 mb-3 text-sm">
            Please add your previous class before continuing.
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Qualification</label>

              {form.level && customTitle && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomTitle(false);
                    setForm((prev) => ({ ...prev, title: "" }));
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Select from list
                </button>
              )}
            </div>

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

                {/* SCHOOL */}
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
                {form.level !== "School" && (
                  <>
                    {titleOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}

                    <option value="other">Other (type manually)</option>
                  </>
                )}
              </select>
            )}

            {/* Manual Qualification */}
            {form.level && customTitle && (
              <InputBox
                name="title"
                placeholder="Enter qualification"
                value={form.title}
                onChange={handleChange}
                required
              />
            )}

            {/* Helper */}
            {form.level !== "School" && !customTitle && (
              <span className="text-[11px] text-gray-400 mt-1">
                Can't find your course? Select "Other"
              </span>
            )}

            {suggestion && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-600">
                <LightBulbIcon className="w-4 h-4 text-yellow-500" />
                <span>{suggestion}</span>
              </div>
            )}
          </div>
        </div>

        {/* Field + Institution + University */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* SPECIALIZATION */}
          {(ui.showSpecialization || showSchoolStream) && (
            <div>
              <label className="text-xs font-medium mb-1">
                {ui.specializationLabel}
              </label>

              <InputBox
                name="specialization"
                placeholder={ui.specializationPlaceholder}
                value={form.specialization}
                onChange={handleChange}
              />
            </div>
          )}

          {/* INSTITUTION */}
          {ui.showInstitution && (
            <div>
              <label className="text-xs font-medium mb-1">
                {ui.institutionLabel}
              </label>

              <InputBox
                name="institution"
                placeholder={ui.institutionLabel}
                value={form.institution}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* UNIVERSITY / BOARD */}
          {ui.showAwarding && (
            <div>
              <label className="text-xs font-medium mb-1">
                {ui.awardingLabel}
              </label>

              <InputBox
                name="awarding_body"
                placeholder={ui.awardingLabel}
                value={form.awarding_body}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* START YEAR */}
          <div>
            <label className="text-xs font-medium mb-1">Start Year</label>

            <select
              name="start_year"
              value={form.start_year || ""}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* END YEAR */}
          <div>
            <div className="flex items-center justify-between h-4 mb-1">
              <label className="text-xs font-medium">Completion Year</label>

              <label className="flex items-center gap-1 text-[11px] text-gray-500">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={form.is_current || false}
                  onChange={handleChange}
                  className="w-3 h-3"
                />
                Present
              </label>
            </div>

            <select
              name="end_year"
              value={form.end_year || ""}
              onChange={handleChange}
              disabled={form.is_current}
              className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">
                {form.is_current ? "Present" : "Select year"}
              </option>

              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* MARKS */}
          {ui.showMarks && (
            <div>
              <label className="text-xs font-medium mb-1">
                Marks(Optional)
              </label>

              <div className="flex border border-gray-300 rounded-md overflow-hidden text-sm focus-within:border-blue-700 hover:border-gray-400">
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
          )}
        </div>

        {/* Location */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LocationDropdown
            type="academic"
            value={form}
            onChange={(type, fields) => {
              setForm((prev) => ({
                ...prev,
                ...fields,
              }));
            }}
            labels={{
              academic: {
                country: "Country",
                state: "State",
                city: "City",
              },
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium mb-1">
            Description(Optional)
          </label>
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

        {/* ACTIONS */}
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

          {/* ONBOARDING NAV BUTTON */}
          {onNext && isAcademicComplete && (
            <button
              type="button"
              onClick={() => onNext()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Continue
            </button>
          )}

          {/* MAIN SUBMIT BUTTON (ONLY ONE ROLE) */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              loading || !isFormValid
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}
