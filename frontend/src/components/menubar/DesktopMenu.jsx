import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import MenuItem from "../../pages/menubar/MenuItem";

import { ChevronDownIcon } from "@heroicons/react/24/solid";

const DesktopMenu = ({ menuData }) => {
  const [active, setActive] = useState(null);

  const ref = useRef();
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setActive(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setActive(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const isOverflowingRight = (index) => {
    const el = itemRefs.current[index];

    if (!el) return false;

    const rect = el.getBoundingClientRect();

    return rect.right + 260 > window.innerWidth;
  };

  return (
    <div
      ref={ref}
      className="
        hidden md:flex flex-wrap items-center
        border-b bg-white
        py-1
        gap-x-0 gap-y-0
      "
    >
      {menuData.map((item, i) => {
        const hasChildren = item.children?.length;

        return (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="relative"
          >
            <div className="group">
              <NavLink
                to={item.path}
                onClick={(e) => {
                  if (item.status !== "published") {
                    e.preventDefault();
                    return;
                  }

                  if (!hasChildren) {
                    setActive(null);
                  }
                }}
                className={({ isActive }) => `
                  inline-flex items-center
                  whitespace-nowrap
                  text-[12px]
                  font-medium
                  transition-all duration-150

                  ${
                    isActive || active === i
                      ? "bg-indigo-200 text-indigo-900"
                      : "text-purple hover:bg-indigo-50 hover:text-indigo-700"
                  }
                `}
              >
                {/* TEXT */}
                <span className="px-1.5 py-1.5 leading-none">{item.name}</span>

                {/* ARROW */}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      setActive(active === i ? null : i);
                    }}
                    className={`
                      -ml-1
                      flex items-center justify-center
                      py-1 pr-1
                      leading-none
                      transition-opacity duration-200

                      ${
                        active === i
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }
                    `}
                  >
                    <ChevronDownIcon
                      className={`
                        h-3.5 w-3.5
                        transition-transform duration-200
                        ${active === i ? "rotate-180" : ""}
                      `}
                    />
                  </button>
                )}
              </NavLink>
            </div>

            {/* DROPDOWN */}
            {hasChildren && active === i && (
              <div
                className={`
                  absolute top-full mt-0
                  w-56 bg-white
                  border border-gray-200
                  shadow-md z-50
                  ${isOverflowingRight(i) ? "right-0" : "left-0"}
                `}
              >
                {item.children.map((child, j) => (
                  <div
                    key={j}
                    className="
                      border-b border-gray-100
                      last:border-b-0
                    "
                  >
                    <MenuItem item={child} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(DesktopMenu);
