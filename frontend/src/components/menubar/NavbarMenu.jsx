import { useState, useRef, useEffect } from "react";
import MenuItem from "../../pages/menubar/MenuItem";
import { NavLink } from "react-router-dom";
import { isRouteEnabled } from "../../config/enabledRoutes";
import { getMenu } from "../../api/menu.api";

const NavbarMenu = () => {
  const [menuData, setMenuData] = useState([]);
  const [active, setActive] = useState(null);
  const [openNested, setOpenNested] = useState(null);
  const [activePath, setActivePath] = useState([]);
  const [anchorRect, setAnchorRect] = useState(null);

  const ref = useRef();
  const itemRefs = useRef([]);

  const MAX_TABS = 5;

  //  FETCH MENU FROM BACKEND
  useEffect(() => {
    getMenu()
      .then((res) => setMenuData(res.data))
      .catch(() => setMenuData([]));
  }, []);

  //  NOW SAFE (after fetch)
  const visibleTabs = menuData.slice(0, MAX_TABS);
  const moreTabs = menuData.slice(MAX_TABS);

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
    <div ref={ref} className="w-full bg-white">
      {/* DESKTOP */}
      <div className="hidden md:flex flex-wrap items-center border-b px-0 py-1 gap-x-0 gap-y-0">
        {menuData.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="relative flex-shrink-0"
          >
            {/* TAB */}
            {!item.children ? (
              <NavLink
                to={item.path}
                onClick={(e) => {
                  if (!isRouteEnabled(item.path)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setActive(null);
                }}
                className={({ isActive }) =>
                  `px-2 py-1.5 text-[12px] whitespace-nowrap rounded-md font-medium transition-all duration-150
                        ${
                          isActive
                            ? "bg-purple text-white shadow-sm"
                            : "text-purple hover:bg-purple/10"
                        }`
                }
              >
                {item.name}
              </NavLink>
            ) : (
              <button
                onClick={() => setActive(active === i ? null : i)}
                className={`px-2 py-1.5 text-[12px] whitespace-nowrap rounded-md font-medium transition-all duration-150
                            ${
                              active === i
                                ? "bg-purple text-white shadow-sm"
                                : "text-purple hover:bg-purple/10"
                            }`}
              >
                {item.name}
              </button>
            )}
            {/* DROPDOWN */}
            {item.children && active === i && (
              <div
                className={`absolute top-full mt-1 w-56 
        bg-slate-50
      border border-gray-200
      rounded-md
      shadow-md
      z-50
      ${isOverflowingRight(i) ? "right-0" : "left-0"}
    `}
              >
                <div className="py-1">
                  <div className="max-h-[70vh] overflow-visible pr-1">
                    {item.children?.map((child, j) => (
                      <div
                        key={j}
                        className="
    text-xs text-gray-900
    border-b border-gray-200
    last:border-b-0
  "
                      >
                        <MenuItem item={child} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MOBILE - HORIZONTAL TABS */}
      <div className="md:hidden">
        {/*  TOP BAR (NO SCROLL) */}
        <div className="flex items-center border-b bg-white px-1 py-1 gap-0.5 overflow-x-auto scrollbar-hide">
          {/* MAIN TABS */}
          {visibleTabs.map((item, i) =>
            !item.children ? (
              <NavLink
                key={i}
                to={item.path}
                onClick={(e) => {
                  if (!isRouteEnabled(item.path)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setActive(null);
                }}
                className={({ isActive }) =>
                  `whitespace-nowrap flex-1 text-center px-0 py-1.5 text-[12px] rounded-sm font-medium transition-all
            ${
              isActive
                ? "bg-purple text-white shadow-sm"
                : "text-purple hover:bg-purple/10"
            }`
                }
              >
                {item.name}
              </NavLink>
            ) : (
              <button
                key={i}
                onClick={() => setActive(active === i ? null : i)}
                className={`flex-shrink-0 px-2.5 py-1 text-[12px] rounded-sm font-medium whitespace-nowrap transition-all
          ${
            active === i
              ? "bg-purple text-white shadow-sm"
              : "text-purple hover:bg-purple/10"
          }`}
              >
                {item.name}
              </button>
            ),
          )}
          {/*  MORE BUTTON */}
          {moreTabs.length > 0 && (
            <button
              onClick={() => setActive(active === "more" ? null : "more")}
              className={`flex-shrink-0 px-2.5 py-1 text-[12px] rounded-sm font-medium whitespace-nowrap transition-all
        ${
          active === "more"
            ? "bg-purple text-white shadow-sm"
            : "text-purple hover:bg-purple/10"
        }`}
            >
              More
            </button>
          )}
        </div>

        {/* PANEL (FOR BOTH NORMAL + MORE) */}
        {active !== null && (
          <div className="px-3 py-3 bg-gray-50">
            {/* NORMAL TAB PANEL */}
            {active !== "more" && menuData[active]?.children && (
              <>
                {menuData[active].children.map((child, i) => (
                  <div key={i} className="mb-4">
                    <h4 className="text-[13px] font-semibold text-gray-800 mb-2">
                      {child.name}
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      {child.children?.map((sub, j) => (
                        <NavLink
                          key={j}
                          to={sub.path}
                          onClick={(e) => {
                            if (!isRouteEnabled(sub.path)) {
                              e.preventDefault();
                              return;
                            }
                            setActive(null);
                          }}
                          className="block text-[12px] bg-white p-2 rounded-md shadow-sm text-purple hover:bg-purple/10"
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
            {active === "more" && (
              <div className="space-y-2">
                {moreTabs.map((item, i) => {
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <div key={i} className="bg-white rounded-md border">
                      {/*  ROW (PARENT) */}
                      <div className="flex items-center justify-between px-3 py-2">
                        {!hasChildren ? (
                          <NavLink
                            to={item.path}
                            onClick={(e) => {
                              if (!isRouteEnabled(item.path)) {
                                e.preventDefault();
                                return;
                              }
                              setActive(null);
                            }}
                            className="text-[13px] font-medium text-purple"
                          >
                            {item.name}
                          </NavLink>
                        ) : (
                          <span className="text-[13px] font-semibold text-gray-800">
                            {item.name}
                          </span>
                        )}

                        {/*  EXPAND ICON */}
                        {hasChildren && (
                          <button
                            onClick={() =>
                              setOpenNested(openNested === i ? null : i)
                            }
                            className="text-purple text-sm"
                          >
                            {openNested === i ? "▾" : "▸"}
                          </button>
                        )}
                      </div>

                      {/*  CHILDREN */}
                      {hasChildren && openNested === i && (
                        <div className="border-t px-3 py-2">
                          <div className="grid grid-cols-2 gap-2">
                            {item.children.map((child, j) => (
                              <NavLink
                                key={j}
                                to={child.path}
                                onClick={(e) => {
                                  if (!isRouteEnabled(child.path)) {
                                    e.preventDefault();
                                    return;
                                  }
                                  setActive(null);
                                }}
                                className="text-[12px] text-gray-700 bg-gray-50 px-2 py-1.5 rounded hover:bg-purple/10 hover:text-purple transition"
                              >
                                {child.name}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarMenu;
