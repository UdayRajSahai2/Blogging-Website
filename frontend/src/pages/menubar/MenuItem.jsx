// frontend/src/pages/menubar/MenuItem.jsx

import React, { useState, useRef, useEffect } from "react";

import { NavLink } from "react-router-dom";

const MenuItem = ({ item, level = 0 }) => {
  const [open, setOpen] = useState(false);

  const itemRef = useRef(null);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isEnabled = item.status === "published";
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (itemRef.current && !itemRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  const [submenuClass, setSubmenuClass] = useState("left");

  useEffect(() => {
    if (open && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();

      setSubmenuClass(window.innerWidth - rect.right < 300 ? "right" : "left");
    }
  }, [open]);
  return (
    <div
      ref={itemRef}
      className="relative border-b border-gray-200 last:border-b-0"
    >
      {/* MENU ITEM */}
      <div
        className="
    group flex justify-between items-center
    px-2 py-2.5
    cursor-pointer
    transition-all duration-150
    text-[12px] text-gray-900
    hover:bg-blue-50 hover:text-blue-600
  "
        onClick={() => {
          if (hasChildren) {
            setOpen((prev) => !prev);
          }
        }}
      >
        <NavLink
          to={hasChildren ? "#" : item.path}
          className="flex-1"
          onClick={(e) => {
            if (!isEnabled) {
              e.preventDefault();
              return;
            }

            // HAS CHILDREN → DON'T NAVIGATE
            // parent div onClick will open submenu
            if (hasChildren) {
              e.preventDefault();
            }
          }}
        >
          {item.name}
        </NavLink>

        {hasChildren && (
          <span
            className="
              ml-auto flex items-center
              text-gray-400
              group-hover:text-blue-600
              transition-transform duration-150
            "
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        )}
      </div>

      {/* SUB MENU */}
      {hasChildren && open && (
        <div
          className={`
                      absolute top-0
                       ${submenuClass === "left" ? "left-full" : "right-full"}
                       w-[280px]
                       bg-slate-50
                       border border-gray-200
                       rounded-md
                       shadow-md
                       z-50
                       
                       `}
        >
          {item.children.map((child, i) => (
            <MenuItem key={i} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(MenuItem);
