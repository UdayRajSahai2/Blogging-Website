import { useEffect, useRef } from "react";
import axios from "axios";
import { USER_API } from "../common/api";

const useLocationTracker = (token) => {
  const lastCoordsRef = useRef(null);
  const lastSentTimeRef = useRef(0);
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    let watchId;

    const MIN_DISTANCE_KM = 0.05; // ~50 meters
    const MIN_TIME_MS = 30000; // 30 seconds

    /* ---------------- DISTANCE CALC ---------------- */
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    /* ---------------- SEND LOCATION ---------------- */
    const sendLocation = async (latitude, longitude) => {
      try {
        await axios.post(
          `${USER_API}/update-location`,
          { latitude, longitude },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        //  Debounced UI refresh
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }

        refreshTimeoutRef.current = setTimeout(() => {
          window.dispatchEvent(new Event("location-updated"));
        }, 2000);
      } catch (err) {
        console.error(" Location update failed:", err);
      }
    };

    /* ----------------  QUICK INITIAL LOCATION ---------------- */
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        lastCoordsRef.current = { lat: latitude, lng: longitude };
        lastSentTimeRef.current = Date.now();

        sendLocation(latitude, longitude);
      },
      () => {
        console.warn(" Initial quick location failed");
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      },
    );

    /* ---------------- WATCH POSITION ---------------- */
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const now = Date.now();

          // Time throttle
          if (now - lastSentTimeRef.current < MIN_TIME_MS) {
            return;
          }

          //  Distance filter
          if (lastCoordsRef.current) {
            const dist = getDistance(
              lastCoordsRef.current.lat,
              lastCoordsRef.current.lng,
              latitude,
              longitude,
            );

            if (dist < MIN_DISTANCE_KM) {
              return;
            }
          }

          // Update refs
          lastCoordsRef.current = { lat: latitude, lng: longitude };
          lastSentTimeRef.current = now;

          sendLocation(latitude, longitude);
        },
        (err) => {
          if (err.code === 3) {
            console.warn("⏳ GPS timeout — retrying automatically");
            return;
          }

          console.error("Geolocation error:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000, // allow cached
          timeout: 20000, // reduce timeout errors
        },
      );
    }

    /* ---------------- CLEANUP ---------------- */
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [token]);
};

export default useLocationTracker;
