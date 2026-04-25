import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const items = [
  { label: "Post your profile", path: "/", icon: "👤" },
  { label: "Post your blog", path: "/editor", icon: "✍️" },
  { label: "Performance rating", path: "/", icon: "⭐" },
];

const YourSpaceCard = () => {
  const [index, setIndex] = useState(0);
  const location = useLocation(); // optional now

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentItem = items[index];

  const content = (
    <div className="w-full flex justify-center animate-slide">
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-xl">{currentItem.icon}</span>

        <p className="text-[12px] font-semibold leading-tight whitespace-nowrap">
          {currentItem.label}
        </p>
      </div>
    </div>
  );

  return (
    <Link
      to={currentItem.path}
      onClick={(e) => {
        if (location.pathname === currentItem.path) {
          e.preventDefault();
        }
      }}
      className="w-full block rounded-lg px-3 py-3 sm:px-4 sm:py-3 bg-gradient-to-r from-purple to-indigo-600 shadow hover:shadow-lg transition text-white"
    >
      {content}
    </Link>
  );
};

export default YourSpaceCard;
