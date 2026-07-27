import { UserCircleIcon } from "@heroicons/react/24/outline";

const PersonalDetailsSection = ({ profile, setProfile, errors }) => {
  return (
    <div className="bg-white border rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <UserCircleIcon className="w-4 h-4 text-indigo-500" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Personal Details
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* GENDER */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Gender
          </label>

          <select
            value={profile.details?.gender || ""}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  gender: e.target.value,
                },
              }))
            }
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* MARITAL STATUS */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Marital Status
          </label>

          <select
            value={profile.details?.marital_status ?? ""}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  marital_status: e.target.value || null,
                },
              }))
            }
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          >
            <option value="">Prefer not to say</option>
            <option value="single">Unmarried (If you need assistance)</option>
            <option value="married">Married</option>
          </select>
        </div>

        {/* Employment */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Employment Status <span className="text-red-500">*</span>
          </label>

          <select
            value={profile.details?.employment_status || ""}
            onChange={(e) => {
              const employmentStatus = e.target.value;

              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  employment_status: employmentStatus,
                  education_status:
                    employmentStatus === "retired"
                      ? "not_student"
                      : prev.details?.education_status,
                },
              }));
            }}
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          >
            <option value="">Select Employment</option>
            <option value="employed">Employed</option>
            <option value="not_working">Unemployed</option>
            <option value="retired">Retired</option>
            <option value="self_employed">Self Employed</option>
          </select>

          {errors?.employment_status && (
            <p className="text-xs text-red-500 mt-1">
              {errors.employment_status}
            </p>
          )}
        </div>

        {/* Education */}
        {profile.details?.employment_status !== "retired" && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Education Status <span className="text-red-500">*</span>
            </label>

            <select
              value={profile.details?.education_status || ""}
              disabled={profile.details?.employment_status === "retired"}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  details: {
                    ...prev.details,
                    education_status: e.target.value,
                  },
                }))
              }
              className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">Select Education</option>
              <option value="student">Student</option>
              <option value="not_student">Not a Student</option>
            </select>

            {errors?.education_status && (
              <p className="text-xs text-red-500 mt-1">
                {errors.education_status}
              </p>
            )}
          </div>
        )}
        {/* DOB */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Date of Birth
          </label>

          <input
            type="date"
            min="1900-01-01" //  minimum date added
            max={new Date().toISOString().split("T")[0]} //  prevents future dates
            value={profile.details?.date_of_birth || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (value && new Date(value) > new Date()) return;

              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  date_of_birth: value,
                },
              }));
            }}
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          />
        </div>

        {/* Alternate Mobile Number */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Alternate Mobile Number
          </label>

          <input
            type="text"
            inputMode="numeric"
            placeholder="1234567890"
            maxLength={15}
            value={profile.details?.alternate_mobile_number || ""}
            onChange={(e) => {
              const value = e.target.value;

              // Allow only digits (0-9) or empty string
              if (value !== "" && !/^\d+$/.test(value)) return;

              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  alternate_mobile_number: value,
                },
              }));
            }}
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          />
        </div>

        {/* FATHER NAME */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Father’s Name
          </label>

          <input
            type="text"
            value={profile.details?.father_name || ""}
            placeholder="Enter father's name"
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  father_name: e.target.value,
                },
              }))
            }
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          />
        </div>

        {/* FATHER PHONE */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Father’s Mobile
          </label>

          <input
            type="tel"
            value={profile.details?.father_phone || ""}
            placeholder="1234567890"
            maxLength={10}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  father_phone: e.target.value.replace(/\D/g, ""),
                },
              }))
            }
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          />
        </div>
        {/* Blood Group */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Blood Group
          </label>

          <select
            value={profile.details?.blood_group || ""}
            onChange={(e) => {
              const value = e.target.value;

              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  blood_group: value,
                },
              }));
            }}
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px]"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;
