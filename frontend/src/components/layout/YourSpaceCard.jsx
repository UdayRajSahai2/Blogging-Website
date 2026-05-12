import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  UserCircleIcon,
  PencilSquareIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const items = [
  {
    label: "Post your profile",
    path: "/",
    icon: UserCircleIcon,
  },
  {
    label: "Post your blog",
    path: "/editor",
    icon: PencilSquareIcon,
  },
  {
    label: "Performance rating",
    path: "/",
    icon: StarIcon,
  },
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
  const Icon = currentItem.icon;

  const content = (
    <div className="w-full flex justify-center animate-slide">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 sm:w-4 sm:h-4" />

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
