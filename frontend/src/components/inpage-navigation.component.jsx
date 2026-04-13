import { useEffect, useRef, useState } from "react";
const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  const activeTabLineRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef([]);

  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  // ---------- Move indicator ----------
  const moveIndicator = (btn) => {
    if (!btn || !activeTabLineRef.current) return;

    const { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";

    // auto scroll into view (great mobile UX)
    btn.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // ---------- Change tab ----------
  const changePageState = (btn, i) => {
    moveIndicator(btn);
    setInPageNavIndex(i);
  };

  // ---------- Keyboard navigation ----------
  const handleKeyDown = (e, i) => {
    let newIndex = i;

    if (e.key === "ArrowRight") {
      newIndex = (i + 1) % routes.length;
    } else if (e.key === "ArrowLeft") {
      newIndex = i === 0 ? routes.length - 1 : i - 1;
    } else if (e.key === "Home") {
      newIndex = 0;
    } else if (e.key === "End") {
      newIndex = routes.length - 1;
    } else {
      return;
    }

    e.preventDefault();

    const nextTab = tabRefs.current[newIndex];
    if (nextTab) {
      nextTab.focus();
      changePageState(nextTab, newIndex);
    }
  };

  // ---------- Initial mount ----------
  useEffect(() => {
    const initialTab = tabRefs.current[defaultActiveIndex];
    if (initialTab) moveIndicator(initialTab);
  }, [defaultActiveIndex]);

  return (
    <>
      {/* ================= TAB BAR ================= */}
      <div
        ref={tabsContainerRef}
        role="tablist"
        className="relative mb-0 bg-white border-b border-grey flex flex-nowrap overflow-x-auto scrollbar-hide"
      >
        {routes.map((route, i) => (
          <button
            key={i}
            ref={(el) => (tabRefs.current[i] = el)}
            role="tab"
            aria-selected={inPageNavIndex === i}
            tabIndex={inPageNavIndex === i ? 0 : -1}
            className={
              "p-1 py-0 px-3 capitalize whitespace-nowrap transition-all duration-200 font-medium " +
              (inPageNavIndex === i
                ? "text-black"
                : "text-gray-500 hover:text-black ") +
              (defaultHidden.includes(route) ? "md:hidden" : "")
            }
            onClick={(e) => changePageState(e.currentTarget, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {route}
          </button>
        ))}

        {/* active indicator */}
        <hr
          ref={activeTabLineRef}
          className="absolute bottom-0 h-[2px] bg-black duration-300"
        />
      </div>

      {/* ================= TAB CONTENT ================= */}
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
