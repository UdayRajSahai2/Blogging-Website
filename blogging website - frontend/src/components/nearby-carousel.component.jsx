import { useEffect, useState } from "react";
import NearbyFlipCard from "./nearby-flip-card.component";

const NearbyCarousel = ({ users = [], intervalMs = 4000 }) => {
  const [index, setIndex] = useState(0);
  const total = users.length;
  const at = (i) => (i + total) % total;

  useEffect(() => {
    if (total <= 2) return; // no need to auto-slide
    const id = setInterval(() => {
      setIndex((i) => at(i + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [total, intervalMs]);

  if (!total) {
    return (
      <div className="text-center text-dark-grey bg-grey/10 rounded-lg py-6">
        No nearby users found
      </div>
    );
  }

  const next = () => setIndex((i) => at(i + 1));
  const prev = () => setIndex((i) => at(i - 1));

  const visible = [users[at(index)]]; // show only 1 card at a time

  return (
    <div className="relative">
      <div className="grid gap-3">
        {visible.map((u, i) => (
          <NearbyFlipCard key={`${index}-${i}`} user={u} index={at(index + i)} />
        ))}
      </div>
      {total > 1 && (
        <div className="flex justify-between mt-3">
          <button
            aria-label="Previous"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            onClick={prev}
          >
            <i className="fi fi-rr-angle-left" />
          </button>
          <button
            aria-label="Next"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            onClick={next}
          >
            <i className="fi fi-rr-angle-right" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyCarousel;


