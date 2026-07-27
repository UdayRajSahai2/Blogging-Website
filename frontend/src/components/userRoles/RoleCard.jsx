import {
  AcademicCapIcon,
  BookOpenIcon,
  HeartIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const ROLE_META = {
  teacher: {
    icon: AcademicCapIcon,
    title: "Teacher",
    description: "Create courses, manage classes, and guide learners.",
  },
  student: {
    icon: BookOpenIcon,
    title: "Student",
    description: "Join courses, track progress, and access learning resources.",
  },
  volunteer: {
    icon: HeartIcon,
    title: "Volunteer",
    description: "Support community activities and participate in events.",
  },
};
export const formatRoleName = (roleName) => {
  return roleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
const RoleCard = ({ role, onRequest, onWithdraw, onSetPrimary }) => {
  const status = role.status;
  const actionSource = role.actionSource || "none";

  const hasRequest = !!status;

  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isRevoked = status === "revoked";

  const isUserRevoked = isRevoked && actionSource === "user";
  const isAdminRevoked = isRevoked && actionSource === "admin";

  const canRequest = !hasRequest || isRejected || isRevoked;

  const meta = ROLE_META[role.name.toLowerCase()] || {
    icon: UserGroupIcon,
    title: role.name,
    description: role.description || "Access additional platform features.",
  };

  const Icon = meta.icon;
  return (
    <div className="flex h-full flex-col rounded-md border border-slate-300 bg-white p-1 m-1 text-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate font-semibold text-slate-900">
              {formatRoleName(role.name)}
            </h4>

            {isPending && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Awaiting Approval
              </span>
            )}

            {isApproved && role.isPrimary && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                Current Role
              </span>
            )}

            {isApproved && !role.isPrimary && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                Available
              </span>
            )}

            {isRejected && (
              <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                Not Approved
              </span>
            )}

            {isUserRevoked && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                Request Cancelled
              </span>
            )}

            {isAdminRevoked && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                Access Removed
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <button
              onClick={() => onWithdraw(role.userRoleId, role.name)}
              className="h-8 rounded border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel Request
            </button>
          )}

          {isApproved && !role.isPrimary && (
            <button
              onClick={() => onSetPrimary(role.name)}
              className="h-8 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
            >
              Make Current Role
            </button>
          )}

          {canRequest && (
            <button
              onClick={() => onRequest(role.name)}
              className="h-8 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
            >
              {!hasRequest
                ? "Request Access"
                : isUserRevoked
                  ? "Request Access Again"
                  : "Request Access"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
