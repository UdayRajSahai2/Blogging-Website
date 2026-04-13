import clsx from "clsx";

const Loader = ({
  center = true,
  fullscreen = false,
  inline = false,
  size = "w-10 h-10",
  color = "border-t-purple-600",
  label = "Loading...",
  className = "",
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={clsx(
        center &&
          !fullscreen &&
          !inline &&
          "min-h-[120px] flex justify-center items-center",
        fullscreen &&
          "fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-sm z-50",
        inline && "inline-flex items-center justify-center",
        className,
      )}
    >
      <div
        className={clsx(
          size,
          "border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin",
          color,
        )}
      />

      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Loader;
