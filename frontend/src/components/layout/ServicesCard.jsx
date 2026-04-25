import React from "react";
import { useNavigate } from "react-router-dom";

const ServicesCard = () => {
  const navigate = useNavigate();

  return (
    <div
      //   onClick={() => navigate("/services")}
      className="rounded-lg overflow-hidden border shadow-sm bg-white cursor-pointer hover:shadow-md transition"
    >
      {/* HEADER */}
      <p
        className="text-sm font-semibold text-white text-center py-1 
        bg-gradient-to-r from-blue-500 to-indigo-500"
      >
        Services Around You
      </p>

      {/* CONTENT */}
      <div className="flex flex-wrap justify-center gap-x-1 gap-y-1 px-2 py-2 text-[12px] text-center">
        <span className="text-blue-600">Local Services</span>
        <span className="text-gray-300">•</span>

        <span className="text-blue-600">Maid Services</span>
        <span className="text-gray-300">•</span>

        <span className="text-blue-600">
          Electricians/Plumbers/Labor around you
        </span>
      </div>
    </div>
  );
};

export default ServicesCard;
