import ReactCountryFlag from "react-country-flag";
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import InputBox from "./input.component";

const EnrollmentFields = ({ referrerMobile, setReferrerMobile, disabled }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <InputBox
          name="referrer_name"
          type="text"
          placeholder="Referrer Full Name"
          disabled={disabled}
          required
          icon={<UserIcon className="w-4 h-4" />}
        />

        <InputBox
          name="referrer_email"
          type="email"
          placeholder="Referrer Email"
          disabled={disabled}
          required
          autoComplete="email"
          icon={<EnvelopeIcon className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputBox
          name="referrer_mobile"
          type="tel"
          placeholder="Referrer Mobile"
          disabled={disabled}
          required
          value={referrerMobile}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setReferrerMobile(value);
          }}
          maxLength={10}
          inputMode="numeric"
          prefix={
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ReactCountryFlag
                countryCode="IN"
                svg
                aria-label="India"
                style={{
                  width: "18px",
                  height: "12px",
                }}
              />
              <span className="font-medium">+91</span>
            </div>
          }
        />

        <InputBox
          name="referrer_district"
          type="text"
          placeholder="Referrer District"
          disabled={disabled}
          required
          icon={<MapPinIcon className="w-4 h-4" />}
        />
      </div>
    </>
  );
};

export default EnrollmentFields;
