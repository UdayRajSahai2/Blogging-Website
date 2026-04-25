import { BriefcaseIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const JobsCard = () => {
  const navigate = useNavigate();

  return (
    <div
      //   onClick={() => navigate("/jobs")}
      className="rounded-lg p-3 bg-gradient-to-br from-green-50 via-white to-emerald-100 border shadow-sm "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-sm flex items-center gap-1">
          <BriefcaseIcon className="w-4 h-4" />
          Jobs
        </p>

        <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
      </div>

      {/* Content */}
      <div className="text-[12px] text-gray-700">
        <p>Employment Opportunities</p>
      </div>
    </div>
  );
};

export default JobsCard;
