import { useEffect, useRef, useState } from "react";
import NearbyFlipCard from "./nearby-flip-card.component";
import { UsersIcon } from "@heroicons/react/24/outline";
const NearbyCarousel = ({ users = [], intervalMs = 5000 }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = users.length;
  const at = (i) => (i + total) % (total || 1);

  const animLockRef = useRef(false);
  const pausedRef = useRef(paused);
  const totalRef = useRef(total);

  // keep refs updated
  useEffect(() => {
    pausedRef.current = paused;
    totalRef.current = total;
  });

  /* -------------------------------
     Auto rotate (FIXED 🔥)
  --------------------------------*/
  useEffect(() => {
    if (total <= 1) return;

    const id = setInterval(() => {
      if (!pausedRef.current && !animLockRef.current) {
        setIndex((i) => (i + 1) % totalRef.current);
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, []); // ✅ ONLY ONCE

  /* -------------------------------
     Manual navigation
  --------------------------------*/
  const goTo = (fn) => {
    if (animLockRef.current) return;

    animLockRef.current = true;
    setIsAnimating(true);
    setIndex(fn);

    setTimeout(() => {
      animLockRef.current = false;
      setIsAnimating(false);
    }, 700);
  };

  const next = () => goTo((i) => at(i + 1));
  const prev = () => goTo((i) => at(i - 1));

  /* -------------------------------
     Empty state
  --------------------------------*/
  if (!total) {
    return (
      <>
        <div className="hidden sm:flex items-center justify-center gap-2 text-dark-grey bg-grey/10 rounded-lg py-6">
          <UsersIcon className="w-4 h-4 opacity-70" />
          <span>No nearby users found</span>
        </div>

        <p className="sm:hidden flex items-center justify-center gap-1 text-dark-grey text-sm py-2">
          <UsersIcon className="w-4 h-4 opacity-70" />
          No nearby users found
        </p>
      </>
    );
  }

  const visible = [users[at(index)]];

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <NearbyFlipCard
        key={`${visible[0].user_id}-${index}`} //  safer than username
        user={visible[0]}
        next={next}
        prev={prev}
        total={total}
        isAnimating={isAnimating}
      />
    </div>
  );
};

export default NearbyCarousel;
