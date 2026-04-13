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
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Occupation Status <span className="text-red-500">*</span>
          </label>

          <select
            value={profile.details?.occupation_status || ""}
            onChange={(e) => {
              const val = e.target.value;

              setProfile((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  occupation_status: val || null,
                },
              }));
            }}
            className={`w-full h-9 rounded-lg px-2 text-[13px] ${
              errors?.occupation_status
                ? "border border-red-400 bg-red-50"
                : "border border-gray-200 bg-gray-50"
            }`}
          >
            <option value="">Select Occupation</option>
            <option value="working">Working</option>
            <option value="not_working">Not Working</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>

          {errors?.occupation_status && (
            <p className="text-xs text-red-500 mt-1">
              {errors.occupation_status}
            </p>
          )}
        </div>
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
            Father’s Mobile Number
          </label>

          <div className="flex items-center h-9 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-100">
            <span className="text-[13px] text-gray-600 border-r px-2">+91</span>

            <input
              type="tel"
              value={profile.details?.father_phone || ""}
              placeholder="9876543210"
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
              className="flex-1 h-full px-2 text-[13px] bg-transparent outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;
