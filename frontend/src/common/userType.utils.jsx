//frontend\src\common\user.utils.jsx
export const getUserTypeFromOccupation = (occupation_status) => {
  if (occupation_status === "working") return "professional";
  if (occupation_status === "student") return "student";
  if (occupation_status === "retired") return "retired";
  if (occupation_status === "not_working") return "open";
  return null;
};
