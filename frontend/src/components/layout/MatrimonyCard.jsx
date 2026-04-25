import React, { useState, useEffect } from "react";
import matrimonyImg from "../../imgs/matrimony.jpg";

const slides = [
  { title: "Unmarried Professionals around you", img: matrimonyImg },
  { title: "Matchmaking", img: matrimonyImg },
  { title: "Success Stories", img: matrimonyImg },
];

const MatrimonyCard = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // ✅ SINGLE AUTO SLIDE (with pause support)
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [paused]);

  const next = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="rounded-lg overflow-hidden border shadow-sm bg-white cursor-pointer">
      {/* TITLE */}
      <p className="text-sm font-semibold text-white text-center py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-t-lg">
        Matrimony
      </p>

      {/* SLIDER */}
      <div
        onClick={next}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative h-32 overflow-hidden"
      >
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 relative">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-32 object-cover"
              />

              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-2 gap-1">
                <p className="text-[12px]">{item.title}</p>
                <div className="w-6 h-[1px] bg-white/60"></div>
              </div>
            </div>
          ))}
        </div>

        {/* DOTS */}
        <div className="absolute bottom-2 w-full flex justify-center gap-1">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatrimonyCard;
