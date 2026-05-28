const UserAvatar = ({
  src,
  name,

  className = "w-10 h-10",

  // Dynamic styles

  ringClassName = "ring-slate-300",
  bgClassName = "bg-white",
  textClassName = "text-xl font-bold tracking-tight",

  roundedClassName = "rounded-full",

  alt = "Profile",
}) => {
  const isValidImage =
    typeof src === "string" &&
    src.trim() !== "" &&
    src !== "null" &&
    src !== "undefined";

  return (
    <div className={`relative ${className} shrink-0`}>
      {/* Fallback */}
      <div
        className={`
          absolute inset-0
          flex items-center justify-center
          select-none ring-2
          ${roundedClassName}
          ${bgClassName}
          ${ringClassName}
          ${textClassName}
        `}
      >
        {name?.charAt(0)?.toUpperCase() || "U"}
      </div>

      {/* Real image */}
      {isValidImage && (
        <img
          src={src}
          alt={alt || name || "Profile"}
          draggable={false}
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.style.display = "none";
          }}
          className={`
            absolute inset-0 w-full h-full
            object-cover ring-2
            ${roundedClassName}
            ${ringClassName}
          `}
        />
      )}
    </div>
  );
};

export default UserAvatar;
