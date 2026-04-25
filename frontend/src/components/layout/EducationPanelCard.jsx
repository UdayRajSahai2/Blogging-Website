import React, { useState, useEffect } from "react";
import educationImg from "../../imgs/education.jpg";

const slides = [
  { title: "Education", img: educationImg },
  { title: "Get Free Education", img: educationImg },
  { title: "Primary Education", img: educationImg },
  { title: "Secondary Education", img: educationImg },
];

const EducationPanelCard = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // AUTO SLIDE (with pause support)
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [paused]);

  const handleClick = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="w-full h-40 rounded-lg overflow-hidden border shadow-sm cursor-pointer relative"
      onClick={handleClick}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* IMAGE */}
      <img
        src={slides[index].img}
        alt={slides[index].title}
        className="w-full h-full object-cover transition-all duration-500"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <p className="text-white font-semibold text-sm text-center px-2">
          {slides[index].title}
        </p>

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

export default EducationPanelCard;
