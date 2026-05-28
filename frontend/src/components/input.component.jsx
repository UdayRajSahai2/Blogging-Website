//frontend\src\components\input.component.jsx
import { useState } from "react";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import EyeSlashIcon from "@heroicons/react/24/outline/EyeSlashIcon";
const InputBox = ({
  name,
  type = "text",
  id,
  value,
  onChange,
  placeholder,
  icon,
  prefix,
  disabled = false,
  ...rest
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  //  Resolve input type
  const inputType =
    type === "password" ? (passwordVisible ? "text" : "password") : type;

  //  Dynamic padding
  const paddingClass = prefix ? "pl-2 pr-2" : icon ? "pl-9 pr-8" : "px-2";

  //  Disabled styles
  const disabledClass = disabled
    ? "opacity-60 cursor-not-allowed bg-gray-100"
    : "";

  return (
    <div className="relative w-full mb-2 sm:mb-3">
      <div
        className={`
    flex items-center h-10 rounded-lg border border-gray-400
    bg-white overflow-hidden
    transition

  ${!disabled && "focus-within:border-blue-700 hover:border-gray-400"}

    ${disabledClass}
  `}
      >
        {/* PREFIX */}
        {prefix && (
          <div className="flex items-center gap-1 border-r px-2 h-full min-w-fit">
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
          inputMode={rest.inputMode || "text"}
          {...rest}
          className={`
   flex-1 h-full bg-white outline-none
    text-[12px] text-gray-800 placeholder:text-gray-400
    ${prefix ? "pl-2 pr-3" : paddingClass}
    ${disabled ? "text-gray-600 cursor-not-allowed" : ""}
  `}
        />

        {/* ICON (if no prefix) */}
        {!prefix && icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* PASSWORD TOGGLE */}
        {type === "password" && (
          <div
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-indigo-500 transition"
            onClick={() => setPasswordVisible((prev) => !prev)}
          >
            {passwordVisible ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBox;
