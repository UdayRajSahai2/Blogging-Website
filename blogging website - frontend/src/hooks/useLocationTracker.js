import { useEffect, useRef } from "react";
import axios from "axios";

// Background location tracker: requests permission once and watches updates.
// Sends throttled updates to /update-location when the user is logged in.
const useLocationTracker = (accessToken) => {
  const watchIdRef = useRef(null);
  const lastSentRef = useRef({ time: 0, lat: null, lon: null });

  useEffect(() => {
    if (!accessToken || !navigator.geolocation) return;

    const maybeSend = async (latitude, longitude) => {
      const now = Date.now();
      const { time, lat, lon } = lastSentRef.current;
      const movedEnough =
        lat == null || lon == null || Math.hypot(latitude - lat, longitude - lon) > 0.0005; // ~50m
      if (!movedEnough || now - time < 30_000) return; // throttle to 30s
      try {
        await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-location",
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        lastSentRef.current = { time: now, lat: latitude, lon: longitude };
      } catch (e) {
        // Silently ignore network errors; we'll retry on next movement
      }
    };

    // Start watching position; this prompts once and persists per browser policy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        maybeSend(latitude, longitude);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [accessToken]);
};

export default useLocationTracker;


