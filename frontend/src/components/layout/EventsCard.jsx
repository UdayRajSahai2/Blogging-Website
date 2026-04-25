import {
  FireIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import event1Imgs from "../../imgs/events-1.jpg";
import event2Imgs from "../../imgs/events-2.jpg";

const EventsCard = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg bg-white border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-0 pb-1 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b flex items-center gap-1">
        <CalendarDaysIcon className="w-4 h-4 text-gray-300" />
        <p className="font-semibold text-sm text-white">Events</p>
      </div>
      {/* Grid - NO padding / NO gap */}
      <div className="grid grid-cols-2 lg:grid-cols-1 divide-x lg:divide-x-0 lg:divide-y">
        {/* Trending */}
        <div className="relative h-[80px] overflow-hidden cursor-pointer group">
          <img
            src={event1Imgs}
            alt="Trending Events"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

          <div className="relative z-10 flex items-center justify-between h-full px-3 text-white">
            <div className="flex items-center gap-1 text-xs font-medium">
              <FireIcon className="w-4 h-4" />
              Trending
            </div>

            <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* Upcoming */}
        <div className="relative h-[80px] overflow-hidden cursor-pointer group">
          <img
            src={event2Imgs}
            alt="Upcoming Events"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

          <div className="relative z-10 flex items-center justify-between h-full px-3 text-white">
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1 text-xs font-medium">
                <CalendarDaysIcon className="w-4 h-4" />
                Upcoming
              </div>
              <p className="text-[10px] opacity-80">Around you / Host</p>
            </div>

            <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsCard;
