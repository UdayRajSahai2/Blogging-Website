import {
  BuildingLibraryIcon,
  BanknotesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const GovtSchemesCard = () => {
  const navigate = useNavigate();

  const schemes = [
    {
      title: "Economic Empowerment",
      icon: BanknotesIcon,
      route: "/schemes/economic",
    },
    {
      title: "Women Empowerment",
      icon: UserGroupIcon,
      route: "/schemes/women",
      isNew: true,
    },

    // future items go here
  ];

  return (
    <div className="rounded-lg bg-gradient-to-br from-indigo-50 via-white to-blue-50 border shadow-sm">
      {/* Header */}
      <div className="px-3 pt-0 pb-1 flex items-center gap-1">
        <BuildingLibraryIcon className="w-4 h-4 text-indigo-600" />
        <p className="font-semibold text-sm">Govt Schemes</p>
      </div>

      {/* Scrollable Content */}
      <div
        className={`px-3 pb-0 pr-1 ${
          schemes.length > 2
            ? "h-[52px] overflow-y-auto"
            : "h-auto overflow-y-hidden"
        }`}
      >
        {schemes.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(item.route)}
              className="flex items-center justify-between text-[12px] text-gray-700 px-1 py-[3px] rounded"
            >
              <div className="flex items-center gap-1">
                <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-600" />
                <span>{item.title}</span>
              </div>

              {/* New Badge */}
              {item.isNew && (
                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded">
                  New
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GovtSchemesCard;
