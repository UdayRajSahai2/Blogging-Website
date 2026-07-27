import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { LOCATION_API } from "../common/api";

/* Wrapper */
export const InputWrapper = ({ children }) => (
  <div className="relative w-full mb-2">
    <div className="flex items-center h-10 rounded-xl border border-gray-500 bg-white shadow-sm focus-within:border-indigo-500 relative">
      {children}
    </div>
  </div>
);

const LocationDropdown = ({ type, value = {}, onChange, labels }) => {
  const current = labels[type];

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  /* ================= FETCH ================= */

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${LOCATION_API}/countries`);
      setCountries(res.data || []);
    } catch {
      setCountries([]);
    }
  };

  const fetchStates = async (country_code) => {
    try {
      const res = await axios.get(
        `${LOCATION_API}/states?country_code=${country_code}`,
      );
      setStates(res.data || []);
    } catch {
      setStates([]);
    }
  };

  const fetchDistricts = async (state_code) => {
    try {
      const res = await axios.get(
        `${LOCATION_API}/districts?state_code=${state_code}`,
      );
      setDistricts(res.data || []);
    } catch {
      setDistricts([]);
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (value.country_code) fetchStates(value.country_code);
  }, [value.country_code]);

  useEffect(() => {
    if (value.state_code) fetchDistricts(value.state_code);
  }, [value.state_code]);

  /* ================= HANDLERS ================= */

  const handleCountry = (code) => {
    const selected = countries.find(
      (c) => String(c.country_code) === String(code),
    );

    onChange(type, {
      country_code: code,
      country: selected?.country_name || "",
      state_code: "",
      state: "",
      district_code: "",
      district: "",
    });
  };

  const handleState = (code) => {
    const selected = states.find((s) => String(s.state_code) === String(code));

    onChange(type, {
      state_code: code,
      state: selected?.state_name || "",
      district_code: "",
      district: "",
    });
  };

  const handleDistrict = (code) => {
    const selected = districts.find(
      (d) => String(d.district_code) === String(code),
    );

    onChange(type, {
      district_code: code,
      district: selected?.district_name || "",
      city: selected?.district_name || "",
    });
  };

  /* ================= UI ================= */

  const selectClass =
    "w-full px-2 pr-8 bg-transparent outline-none appearance-none [&::-ms-expand]:hidden";

  const iconClass =
    "w-4 h-4 absolute right-3 pointer-events-none text-gray-500";

  return (
    <>
      {/* COUNTRY */}
      <div className="flex flex-col">
        <label className="text-xs mb-1 text-gray-500">{current.country}</label>
        <InputWrapper>
          <select
            value={value.country_code || ""}
            onChange={(e) => handleCountry(e.target.value)}
            className={selectClass}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.country_code} value={c.country_code}>
                {c.country_name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={iconClass} />
        </InputWrapper>
      </div>

      {/* STATE */}
      <div className="flex flex-col">
        <label className="text-xs mb-1 text-gray-500">{current.state}</label>
        <InputWrapper>
          <select
            value={value.state_code || ""}
            onChange={(e) => handleState(e.target.value)}
            className={selectClass}
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.state_code} value={s.state_code}>
                {s.state_name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={iconClass} />
        </InputWrapper>
      </div>

      {/* CITY */}
      <div className="flex flex-col">
        <label className="text-xs mb-1 text-gray-500">{current.city}</label>
        <InputWrapper>
          <select
            value={value.district_code || ""}
            onChange={(e) => handleDistrict(e.target.value)}
            className={selectClass}
          >
            <option value="">Select City</option>
            {districts.map((d) => (
              <option key={d.district_code} value={d.district_code}>
                {d.district_name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={iconClass} />
        </InputWrapper>
      </div>
    </>
  );
};

export default LocationDropdown;
