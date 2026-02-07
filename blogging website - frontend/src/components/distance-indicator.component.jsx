import { useState, useEffect } from "react";

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
      <i className="fi fi-rr-marker"></i>
      {distance ? (
        <span>Near You: {distance} Mtr away</span>
      ) : (
        <span>Loading location...</span>
      )}
    </div>
  );
};

export default DistanceIndicator;