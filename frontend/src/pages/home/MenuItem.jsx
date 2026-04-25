import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";
import { isRouteEnabled } from "../../config/enabledRoutes";

const MenuItem = ({ item, level = 0 }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const itemRef = useRef(null);
  const portalRef = useRef(null);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  // Calculate position for portal dropdown
  useEffect(() => {
    if (open && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();

      const menuWidth = 220; // same as your dropdown width
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      const shouldOpenLeft = spaceRight < menuWidth && spaceLeft > menuWidth;

      setPosition({
        top: rect.top - 4, //  slight alignment fix
        left: shouldOpenLeft
          ? rect.left - menuWidth - 8 //  small gap
          : rect.right + 7, //  small gap from arrow
      });
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        itemRef.current &&
        !itemRef.current.contains(e.target) &&
        portalRef.current &&
        !portalRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      {/* ITEM */}
      <div className="border-b border-gray-200 last:border-b-0">
        <div
          ref={itemRef}
          className="relative w-full"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setOpen((prev) => !prev);
          }}
        >
          <div
            className="
    group flex justify-between items-center
    px-2 py-1.5
    cursor-pointer
    transition-all duration-150
    text-[12px] text-gray-900
    hover:bg-blue-50 hover:text-blue-600
  "
          >
            {!hasChildren ? (
              <NavLink
                to={item.path}
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isRouteEnabled(item.path)) {
                    e.preventDefault();
                  }
                }}
              >
                {item.name}
              </NavLink>
            ) : (
              <span className="flex-1">{item.name}</span>
            )}

            {hasChildren && (
              <span className="ml-auto flex items-center text-gray-400 group-hover:text-blue-600 transition-transform duration-150 group-hover:translate-x-0.5">
                <svg
                  className="w-3 h-3"
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
        </div>

        {/*  PORTAL DROPDOWN */}
        {hasChildren &&
          open &&
          position &&
          createPortal(
            <div
              ref={portalRef}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left + 4,
                width: 220,
                zIndex: 9999,
              }}
              className="
        bg-white 
        border border-gray-200 
        rounded-md 
        shadow-md
      "
            >
              {item.children.map((child, i) => (
                <MenuItem key={i} item={child} level={level + 1} />
              ))}
            </div>,
            document.getElementById("portal-root"),
          )}
      </div>
    </>
  );
};

export default MenuItem;
