import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AuthActionBox = ({
  to = "/signup",
  icon = "",
  title = "Title",
  subtitle = "Subtitle",
  gradient = "from-gray-700 to-indigo-800",
  height = "h-fit",
  disabled = false,
}) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      toast("🚧 This feature is coming soon!");
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`w-full ${height} rounded-lg p-3 sm:p-4 bg-gradient-to-r ${gradient} 
      flex items-center justify-center text-white transition
      ${disabled ? "opacity-70 cursor-not-allowed" : "shadow hover:shadow-lg"}`}
    >
      <div className="flex flex-col items-center justify-center text-center gap-2">
        {icon && <i className={`fi ${icon} text-xl sm:text-2xl`}></i>}

        {title && <p className="text-sm sm:text-base font-semibold">{title}</p>}

        {subtitle && (
          <p className="text-xs sm:text-sm text-white/80">{subtitle}</p>
        )}

        {disabled && (
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
            Coming Soon
          </span>
        )}
      </div>
    </Link>
  );
};

export default AuthActionBox;
