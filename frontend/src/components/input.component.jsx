import { useState } from "react";

const InputBox = ({
  name,
  type = "text",
  id,
  value,
  onChange,
  placeholder,
  icon,
  prefix, // NEW
  disabled = false,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  // 🔹 Resolve input type
  const inputType =
    type === "password" ? (passwordVisible ? "text" : "password") : type;

  // 🔹 Dynamic padding
  const paddingClass = prefix ? "pl-2 pr-2" : icon ? "pl-9 pr-8" : "px-2";

  // 🔹 Disabled styles
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div className="relative w-full mb-2 sm:mb-3">
      <div
        className={`
      flex items-center h-10 rounded-xl border border-gray-500
      bg-white/70 backdrop-blur-sm
      shadow-sm hover:shadow-md
      transition-all duration-200
      focus-within:border-indigo-500 
      focus-within:ring-2 focus-within:ring-indigo-100
      focus-within:shadow-md
      focus-within:bg-white
      ${disabled ? "cursor-not-allowed" : ""}
    `}
      >
        {/* PREFIX */}
        {prefix && (
          <div className="flex items-center gap-1 border-r px-2 h-full">
            {prefix}
          </div>
        )}

        {/* INPUT */}
        <input
          name={name}
          type={inputType}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
    flex-1 h-full bg-transparent outline-none
    text-[13px] placeholder:text-gray-500
    ${prefix ? "px-2" : paddingClass}
    ${disabled ? "text-gray-600 cursor-not-allowed" : ""}
  `}
        />

        {/* ICON (if no prefix) */}
        {!prefix && icon && (
          <i
            className={`fi ${icon} absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-800 text-xs`}
          />
        )}

        {/* PASSWORD TOGGLE */}
        {type === "password" && (
          <i
            className={`fi ${
              passwordVisible ? "fi-rr-eye" : "fi-rr-eye-crossed"
            } absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs cursor-pointer hover:text-indigo-500 transition`}
            onClick={() => setPasswordVisible((prev) => !prev)}
          />
        )}
      </div>
    </div>
  );
};

export default InputBox;
