import InputBox from "../../input.component";
import {
  HomeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const InputWrapper = ({ children, className = "" }) => (
  <div className={`relative w-full mb-2 sm:mb-3 ${className}`}>
    <div
      className="
        flex items-center h-10 rounded-lg border border-gray-400
        bg-white/70 backdrop-blur-sm
        shadow-sm hover:shadow-md
        transition-all duration-200
        focus-within:border-indigo-500 
        focus-within:ring-2 focus-within:ring-indigo-100
        focus-within:bg-white
      "
    >
      {children}
    </div>
  </div>
);
const AddressSection = ({
  title,
  data = {},
  type,
  updateAddress,
  countries = [],
  states = [],
  districts = [],
  fetchStates,
  fetchDistricts,
}) => {
  const iconMap = {
    personal: <HomeIcon className="w-4 h-4" />,
    work: <BriefcaseIcon className="w-4 h-4" />,
    office: <BuildingOfficeIcon className="w-4 h-4" />,
  };

  const labels = {
    personal: {
      city: "City",
      state: "State",
      country: "Country",
      zip: "Zip Code",
      street: "Street Address",
    },
    office: {
      city: "Office City",
      state: "Office State",
      country: "Office Country",
      zip: "Office Zip Code",
      street: "Office Address",
    },
    work: {
      city: "Work City",
      state: "Work State",
      country: "Work Country",
      zip: "Work Zip Code",
      street: "Work Address",
    },
  };

  const getLabels = (type) => {
    return (
      labels[type] || {
        city: "City",
        state: "State",
        country: "Country",
        zip: "Zip Code",
        street: "Address",
      }
    );
  };

  const current = getLabels(type);

  return (
    <div className="bg-white border rounded-lg p-2 sm:p-3 space-y-1">
      <p className="text-xs font-semibold text-gray-600 uppercase">{title}</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-1">
        {/* STREET */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-gray-600">
            {current.street}
          </label>
          <InputBox
            value={data.street || ""}
            placeholder="Enter address"
            icon={iconMap[type]}
            onChange={(e) => updateAddress(type, "street", e.target.value)}
          />
        </div>

        {/* COUNTRY */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-gray-600">
            {current.country}
          </label>

          <InputWrapper>
            <select
              value={String(data.country_code || "")}
              onChange={(e) => {
                const value = e.target.value;

                const selected = countries.find(
                  (c) => String(c.country_code) === String(value),
                );

                // SAVE BOTH code + name
                updateAddress(type, "country_code", value);
                updateAddress(type, "country", selected?.country_name || "");

                // RESET dependent fields (VERY IMPORTANT)
                updateAddress(type, "state_code", "");
                updateAddress(type, "state", "");

                updateAddress(type, "district_code", "");
                updateAddress(type, "district", "");

                if (fetchStates) fetchStates(value, type);
              }}
              className="w-full h-full bg-transparent outline-none px-2 text-[13px] appearance-none"
            >
              <option value="">Select Country</option>
              {(Array.isArray(countries) ? countries : []).map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>

            <ChevronDownIcon className="w-4 h-4 absolute right-2 text-gray-400 pointer-events-none" />
          </InputWrapper>
        </div>

        {/* STATE */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-gray-600">
            {current.state}
          </label>

          <InputWrapper>
            <select
              value={String(data.state_code || "")}
              onChange={(e) => {
                const value = e.target.value;
                const selected = states.find(
                  (s) => String(s.state_code) === String(value),
                );

                updateAddress(type, "state_code", value);
                updateAddress(type, "state", selected?.state_name || "");

                updateAddress(type, "district_code", "");
                updateAddress(type, "district", ""); //

                if (fetchDistricts) fetchDistricts(value, type);
              }}
              className="w-full h-full bg-transparent outline-none px-2 text-[13px] appearance-none"
            >
              <option value="">Select State</option>
              {(Array.isArray(states) ? states : []).map((s) => (
                <option key={s.state_code} value={s.state_code}>
                  {s.state_name}
                </option>
              ))}
            </select>

            <ChevronDownIcon className="w-4 h-4 absolute right-2 text-gray-400 pointer-events-none" />
          </InputWrapper>
        </div>

        {/* CITY (uses district under the hood) */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-gray-600">
            {current.city}
          </label>

          <InputWrapper>
            <select
              value={String(data.district_code || "")}
              onChange={(e) => {
                const value = e.target.value;
                const selected = districts.find(
                  (d) => d.district_code === value,
                );

                updateAddress(type, "district_code", value);
                updateAddress(type, "district", selected?.district_name || "");
              }}
              className="w-full h-full bg-transparent outline-none px-2 text-[13px] appearance-none"
            >
              <option value="">Select City</option>
              {(Array.isArray(districts) ? districts : []).map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </select>

            <ChevronDownIcon className="w-4 h-4 absolute right-2 text-gray-400 pointer-events-none" />
          </InputWrapper>
        </div>

        {/* ZIP */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-gray-600">
            {current.zip}
          </label>
          <InputBox
            value={data.zip_code || ""}
            placeholder="Zip Code"
            icon={iconMap[type]}
            onChange={(e) => updateAddress(type, "zip_code", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
