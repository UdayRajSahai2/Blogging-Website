import React from "react";

const HelplineCard = () => {
  return (
    <div
      className="w-full h-full rounded-xl p-3
      bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 
      border shadow-sm"
    >
      {/* Header */}
      <p className="font-semibold text-sm mb-2 text-red-600 text-center">
        🚨 Help Line
      </p>

      {/* Items */}
      <div
        className="
          flex flex-wrap gap-2 text-[12px] text-gray-700
          justify-center
        "
      >
        <div className="flex flex-wrap gap-2 text-[12px] text-gray-700 justify-center items-center">
          <span className="cursor-pointer hover:text-red-600 transition">
            Legal support
          </span>

          <span className="text-gray-400">•</span>

          <span className="cursor-pointer hover:text-red-600 transition">
            Injustice around you
          </span>

          <span className="text-gray-400">•</span>

          <span className="cursor-pointer hover:text-red-600 transition">
            Corruption reports
          </span>
        </div>
      </div>
    </div>
  );
};

export default HelplineCard;
