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
    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 origin-top-right animate-notification">
      <h3 className="px-4 py-2 font-semibold border-b">Notifications</h3>

      {notifications.length ? (
        notifications.map((n) => (
          <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50">
            <div className="text-lg">{getIcon(n.type)}</div>

            <div className="text-sm">
              <p className="text-gray-700">{n.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="p-4 text-sm text-gray-500">No new notifications</p>
      )}

      <Link
        to="/dashboard/notifications"
        className="block text-center text-sm text-purple-600 py-2 border-t"
      >
        View all
      </Link>
    </div>
  );
};

export default NotificationPanel;
