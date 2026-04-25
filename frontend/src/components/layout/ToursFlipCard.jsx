import { GlobeAltIcon, MapIcon } from "@heroicons/react/24/outline";

const ToursFlipCard = () => {
  return (
    <div className="rounded-lg p-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border shadow-sm group hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <GlobeAltIcon className="w-4 h-4 text-blue-600" />
        <p className="font-semibold text-sm text-gray-800">Tours & Travel</p>
      </div>

      {/* Content */}
      <div className="text-[12px] text-gray-700 space-y-1">
        <div className="flex items-center gap-1">
          <MapIcon className="w-3.5 h-3.5 text-indigo-500" />
          <p>European Tours</p>
        </div>

        <div className="flex items-center gap-1">
          <MapIcon className="w-3.5 h-3.5 text-indigo-500" />
          <p>9 Days / 10 Nights Singapore</p>
        </div>
      </div>
    </div>
  );
};

export default ToursFlipCard;
