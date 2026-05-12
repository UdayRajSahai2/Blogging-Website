import React from "react";
import { ShieldExclamationIcon } from "@heroicons/react/24/solid";

const HelplineCard = () => {
  return (
    <div
      className="
        w-full h-full rounded-xl p-3
        bg-gradient-to-br from-red-50 via-pink-50 to-orange-50
        border shadow-sm
      "
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-1 mb-1 text-red-600">
        <ShieldExclamationIcon className="w-3.5 h-3.5 relative -top-[1px]" />

        <p className="font-semibold text-sm">Help Line</p>
      </div>

      {/* Items */}
      <div
        className="
          flex items-center justify-center flex-wrap
          gap-x-2 gap-y-1
          text-[12px] text-gray-700 text-center
        "
      >
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
  );
};

export default HelplineCard;
