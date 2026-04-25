import { useEffect, useRef, useState } from "react";

const AdminStatCard = ({
  title,
  value,
  isCurrency = false,
  icon = null,
  trend = null,
  color = "emerald",
  duration = 900,
  onClick = null,
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);
  const hasAnimated = useRef(false);

  const numericValue = typeof value === "number" ? value : Number(value) || 0;

  const colorMap = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  // reset animation when value changes
  useEffect(() => {
    hasAnimated.current = false;
    setDisplayValue(0);
  }, [numericValue]);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;

        hasAnimated.current = true;

        const startTime = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * numericValue);

          setDisplayValue(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayValue(numericValue);
          }
        };

        requestAnimationFrame(animate);
      },
      { threshold: 0.4 },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [numericValue, duration]);

  const formattedValue = displayValue.toLocaleString();

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative bg-white border border-gray-200 rounded-xl p-3 sm:p-4 transition-all ${
        onClick ? "cursor-pointer hover:shadow-md active:scale-[0.98]" : ""
      }`}
    >
      {/* accent */}
      <div
        className={`absolute top-0 left-0 w-full h-[3px] rounded-t-xl ${
          colorMap[color] || colorMap.emerald
        }`}
      />

      {/* header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] sm:text-xs text-gray-500 truncate">{title}</p>

        {icon && (
          <div className="p-1.5 sm:p-2 rounded-md bg-gray-100 text-gray-600">
            {icon}
          </div>
        )}
      </div>

      {/* value */}
      {loading ? (
        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded mt-2" />
      ) : (
        <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1">
          {isCurrency ? `₹${formattedValue}` : formattedValue}
        </p>
      )}

      {/* trend */}
      {trend && (
        <div
          className={`text-[10px] sm:text-xs mt-1 font-medium ${
            trend.positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}%
          <span className="text-gray-400 ml-1 hidden sm:inline">vs last</span>
        </div>
      )}
    </div>
  );
};
export default AdminStatCard;
