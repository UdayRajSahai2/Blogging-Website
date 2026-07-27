import ProfessionSelector from "../experience/ProfessionSelector";
import InputBox from "../../input.component";
import LocationDropdown from "../../../common/LocationDropdown";
const ExperienceForm = ({
  form,
  setForm,
  loading,
  editingId,
  selectedDomain,
  selectedField,
  selectedSpecialty,
  setSelectedDomain,
  setSelectedField,
  setSelectedSpecialty,
  onSave,
  onCancel,
}) => {
  return (
    <div className="border rounded-lg bg-white p-3 shadow-sm space-y-3 text-sm">
      {/* PROFESSION */}
      <ProfessionSelector
        selectedDomain={selectedDomain}
        selectedField={selectedField}
        selectedSpecialty={selectedSpecialty}
        onDomainChange={(val) => {
          setSelectedDomain(val);
          setSelectedField("");
          setSelectedSpecialty("");
        }}
        onFieldChange={(val) => {
          setSelectedField(val);
          setSelectedSpecialty("");
        }}
        onSpecialtyChange={(val) => {
          setSelectedSpecialty(val);

          if (!val) {
            setForm((p) => ({
              ...p,
              profession_id: null,
              custom_profession: null,
            }));
          } else if (typeof val === "string" && val.startsWith("other:")) {
            setForm((p) => ({
              ...p,
              profession_id: null,
              custom_profession: val.replace("other:", ""),
            }));
          } else if (val === "other") {
            setForm((p) => ({
              ...p,
              profession_id: null,
              custom_profession: null,
            }));
          } else {
            setForm((p) => ({
              ...p,
              profession_id: Number(val),
              custom_profession: null,
            }));
          }
        }}
      />

      {/* DESIGNATION + COMPANY */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-base text-gray-800 font-medium mb-1 block">
            Designation
          </label>
          <InputBox
            placeholder="e.g. Hardware Designer, Athlete"
            value={form.designation}
            maxLength={50} //  limit to 50 chars
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="border px-2 py-1.5 rounded w-full"
          />
        </div>

        <div>
          <label className="text-base text-gray-800 font-medium mb-1 block">
            Organization
          </label>
          <InputBox
            placeholder="e.g.Infosys"
            value={form.employer_name}
            maxLength={50} // limit to 50 chars
            onChange={(e) =>
              setForm({ ...form, employer_name: e.target.value })
            }
            className="border px-2 py-1.5 rounded w-full"
          />
        </div>
      </div>
      {/* INDUSTRY + EMPLOYMENT TYPE */}
      <div className="grid grid-cols-2 gap-3">
        {/* INDUSTRY */}
        <div>
          <label className="text-base text-gray-800 font-medium mb-1 block">
            Industry
          </label>
          <InputBox
            placeholder="e.g. Electronics, Education"
            value={form.industry}
            maxLength={50}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            className="border px-2 py-1.5 rounded w-full"
          />
        </div>

        {/* EMPLOYMENT TYPE */}
        <div>
          <label className="text-base text-gray-800 font-medium mb-1 block">
            Employment Type
          </label>
          <select
            value={form.employment_type}
            onChange={(e) =>
              setForm({ ...form, employment_type: e.target.value })
            }
            className="
    w-full
    rounded
    border
    border-gray-300
    bg-gray-50
    px-2
    py-2.5
    text-sm
    text-gray-800
    outline-none
    focus:border-gray-500
    focus:bg-white
  "
          >
            <option value="">Select type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>
      {/* LOCATION */}
      <div>
        <label className="text-base text-gray-800 font-medium mb-1 block">
          Work Location
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LocationDropdown
            type="experience"
            value={form}
            onChange={(type, fields) => {
              setForm((prev) => ({
                ...prev,
                ...fields,
              }));
            }}
            labels={{
              experience: {
                country: "Country",
                state: "State",
                city: "City",
              },
            }}
          />
        </div>
      </div>
      {/* DATES */}
      <div>
        <label className="text-base text-gray-800 font-medium mb-1 block">
          Work Duration
        </label>

        <div className="grid grid-cols-3 gap-3 items-end">
          {/* START DATE */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Start Date
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="border px-2 py-1.5 rounded w-full"
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              disabled={form.is_current}
              className={`border px-2 py-1.5 rounded w-full ${
                form.is_current ? "bg-gray-100 opacity-60" : ""
              }`}
            />
          </div>

          {/* CURRENT CHECKBOX */}
          <div className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={(e) =>
                setForm({ ...form, is_current: e.target.checked })
              }
            />
            <span className="text-xs text-gray-800 font-medium">
              Currently working here
            </span>
          </div>
        </div>
      </div>

      {/* TEXT AREAS SIDE BY SIDE */}
      <div>
        <label className="text-base text-gray-800 font-medium mb-1 block">
          Experience Details
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* WHAT YOU DID */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Roles & Responsibilities
            </label>
            <textarea
              placeholder="Describe your main responsibilities and daily work"
              maxLength={3000}
              value={form.roles_responsibilities}
              onChange={(e) =>
                setForm({ ...form, roles_responsibilities: e.target.value })
              }
              className="border px-2 py-1.5 rounded min-h-[80px] w-full"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {form.roles_responsibilities?.length || 0}/3000
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Achievements
            </label>
            <textarea
              placeholder="Describe your achievements, contributions"
              maxLength={2000}
              value={form.achievements}
              onChange={(e) =>
                setForm({ ...form, achievements: e.target.value })
              }
              className="border px-2 py-1.5 rounded min-h-[80px] w-full"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {form.achievements?.length || 0}/2000
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mt-2">
        {/* PRIMARY BUTTON */}
        <button
          onClick={onSave}
          disabled={loading}
          className={`
               flex-1 py-2 rounded-lg text-sm font-medium
               text-white bg-indigo-600 hover:bg-indigo-700
               transition disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center justify-center gap-2
                   `}
        >
          {loading && (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading
            ? "Saving..."
            : editingId
              ? "Update Experience"
              : "Add Experience"}
        </button>

        {/* CANCEL BUTTON */}
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ExperienceForm;
