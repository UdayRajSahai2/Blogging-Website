import { Link } from "react-router-dom";

const getIcon = (type) => {
  switch (type) {
    case "like":
      return <i className="fi fi-rr-heart text-red-500"></i>;
    case "comment":
      return <i className="fi fi-rr-comment text-blue-500"></i>;
    case "reply":
      return <i className="fi fi-rr-reply text-green-500"></i>;
    default:
      return <i className="fi fi-rr-bell text-gray-400"></i>;
  }
};

const NotificationPanel = ({ notifications }) => {
  return (
    <div
      className="
        fixed inset-x-3 top-20
        bg-white border rounded-xl shadow-xl z-50
        max-h-[70vh] overflow-y-auto
        sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2
        sm:w-80 sm:max-h-[420px]
        origin-top-right animate-notification
      "
    >
      {/* Header */}
      <h3 className="px-4 py-3 font-semibold border-b sticky top-0 bg-white z-10">
        Notifications
      </h3>

      {/* Body */}
      {notifications.length ? (
        notifications.map((n) => (
          <div
            key={n.id}
            className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="text-lg mt-0.5 flex-shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="text-sm leading-snug">
              <p className="text-gray-700">{n.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="p-4 text-sm text-gray-500 text-center">
          No new notifications
        </p>
      )}

      {/* Footer */}
      <Link
        to="/dashboard/notifications"
        className="block text-center text-sm font-medium text-purple-600 py-3 border-t hover:bg-purple-50 transition"
      >
        View all
      </Link>
    </div>
  );
};

export default NotificationPanel;
