//frontend\src\utils\userBadge.js
import {
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
export const getUserTypeBadge = (type) => {
  switch (type) {
    case "professional":
      return {
        label: "Professional",
        icon: BriefcaseIcon,
        className: "bg-emerald-100 text-emerald-700",
      };

    case "student":
      return {
        label: "Student",
        icon: AcademicCapIcon,
        className: "bg-sky-100 text-sky-700",
      };

    case "working_student":
      return {
        label: "Working Student",
        icon: AcademicCapIcon,
        className: "bg-indigo-100 text-indigo-700",
      };

    case "retired":
      return {
        label: "Retired",
        icon: SparklesIcon,
        className: "bg-zinc-100 text-zinc-700",
      };

    case "open":
      return {
        label: "Open",
        icon: SparklesIcon,
        className: "bg-gray-100 text-gray-700",
      };

    default:
      return null;
  }
};
