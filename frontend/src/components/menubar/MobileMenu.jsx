import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import { ChevronRightIcon } from "@heroicons/react/24/solid";

const MobileMenu = ({ menuData }) => {
  const [active, setActive] = useState(null);
  const [openNested, setOpenNested] = useState(null);

  const MAX_TABS = 5;

  const visibleTabs = menuData.slice(0, MAX_TABS);
  const moreTabs = menuData.slice(MAX_TABS);

  const mobileTabClass = (activeState) =>
    `
      px-2.5 py-1.5
      text-[12px]
      rounded-sm
      font-medium
      whitespace-nowrap
      transition-all
      ${
        activeState
          ? "bg-indigo-100 text-indigo-900"
          : "text-purple hover:bg-indigo-50 hover:text-indigo-700"
      }
    `;

  return (
    <div className="md:hidden">
      {/* TOP BAR */}
      <div className="flex items-center border-b bg-white px-1 py-1 gap-0.5 overflow-x-auto scrollbar-hide">
        {/* MAIN TABS */}
        {visibleTabs.map((item, i) =>
          !item.children ? (
            <NavLink
              key={i}
              to={item.path}
              onClick={(e) => {
                if (item.status !== "published") {
                  e.preventDefault();
                  return;
                }

                setActive(null);
              }}
              className={({ isActive }) => mobileTabClass(isActive)}
            >
              {item.name}
            </NavLink>
          ) : (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`flex-shrink-0 ${mobileTabClass(active === i)}`}
            >
              {item.name}
            </button>
          ),
        )}

        {/* MORE BUTTON */}
        {moreTabs.length > 0 && (
          <button
            onClick={() => setActive(active === "more" ? null : "more")}
            className={`flex-shrink-0 ${mobileTabClass(active === "more")}`}
          >
            More
          </button>
        )}
      </div>

      {/* PANEL */}
      {active !== null && (
        <div className="bg-gray-50">
          {/* NORMAL MOBILE TABS */}
          {active !== "more" && menuData[active]?.children && (
            <div className="space-y-0">
              {menuData[active].children.map((child, i) => {
                const hasSubChildren =
                  child.children && child.children.length > 0;

                return (
                  <div key={i} className="bg-white border-b border-gray-200">
                    {/* PARENT CHILD ROW */}
                    <button
                      onClick={() =>
                        setOpenNested(
                          openNested === `normal-${i}` ? null : `normal-${i}`,
                        )
                      }
                      className="
                            w-full
                            flex items-center justify-between
                            px-3 py-2
                            text-[13px]
                            font-normal
                            text-purple
                          "
                    >
                      <span>{child.name}</span>

                      {hasSubChildren && (
                        <span
                          className={`
                                flex items-center justify-center
                                text-indigo-700
                                transition-transform duration-200
                                ${
                                  openNested === `normal-${i}`
                                    ? "rotate-90"
                                    : ""
                                }
                              `}
                        >
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>

                    {/* CHILD-CHILD */}
                    {hasSubChildren && openNested === `normal-${i}` && (
                      <div className="border-t px-3 py-2">
                        <div className="grid grid-cols-2 gap-2">
                          {child.children.map((sub, j) => (
                            <NavLink
                              key={j}
                              to={sub.path}
                              onClick={(e) => {
                                if (sub.status !== "published") {
                                  e.preventDefault();
                                  return;
                                }

                                setActive(null);
                                setOpenNested(null);
                              }}
                              className="
                                        block
                                        text-[12px]
                                        bg-gray-50
                                        px-2 py-1.5
                                        rounded
                                        text-indigo-700
                                        hover:bg-indigo-50
                                        hover:text-indigo-900
                                        transition
                                      "
                            >
                              {sub.name}
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

          {/* MORE MENU */}
          {active === "more" && (
            <div className="space-y-2">
              {moreTabs.map((item, i) => {
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={i} className="bg-white rounded-md border">
                    {/* TOP ROW */}
                    <div className="flex items-center justify-between px-3 py-2">
                      {!hasChildren ? (
                        <NavLink
                          to={item.path}
                          onClick={(e) => {
                            if (item.status !== "published") {
                              e.preventDefault();
                              return;
                            }

                            setActive(null);
                          }}
                          className="
                            text-[13px]
                            font-medium
                            text-indigo-700
                          "
                        >
                          {item.name}
                        </NavLink>
                      ) : (
                        <button
                          onClick={() =>
                            setOpenNested(
                              openNested === `more-${i}` ? null : `more-${i}`,
                            )
                          }
                          className="
                            w-full
                            flex items-center justify-between
                            text-[13px]
                            font-medium
                            text-purple
                          "
                        >
                          <span>{item.name}</span>

                          <span
                            className={`
                              flex items-center justify-center
                              text-indigo-700
                              transition-transform duration-200
                              ${openNested === `more-${i}` ? "rotate-90" : ""}
                            `}
                          >
                            <ChevronRightIcon className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      )}
                    </div>

                    {/* CHILDREN */}
                    {hasChildren && openNested === `more-${i}` && (
                      <div className="border-t px-3 py-2">
                        <div className="grid grid-cols-2 gap-2">
                          {item.children.map((child, j) => (
                            <NavLink
                              key={j}
                              to={child.path}
                              onClick={(e) => {
                                if (child.status !== "published") {
                                  e.preventDefault();
                                  return;
                                }

                                setActive(null);
                                setOpenNested(null);
                              }}
                              className="
                                    text-[12px]
                                    bg-gray-50
                                    px-2 py-1.5
                                    rounded
                                    text-indigo-700
                                    hover:bg-indigo-50
                                    hover:text-indigo-900
                                    transition
                                  "
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
  );
};

export default React.memo(MobileMenu);
