import { useState, useEffect } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
const DistanceIndicator = () => {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch location data
    const fetchLocation = async () => {
      try {
        // Mock distance for demo
        setDistance("500");
      } catch (err) {
        console.error("Error getting location:", err);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="distance-indicator">
      <MapPinIcon className="w-4 h-4" />
      {distance ? (
        <span>Near You: {distance} Mtr away</span>
      ) : (
        <span>Loading location...</span>
      )}
    </div>
  );
};

export default DistanceIndicator;
