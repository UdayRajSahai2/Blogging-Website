import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFriendsAPI, removeConnectionAPI } from "../../api/connection.api";
import ConnectionButton from "../../components/connection/ConnectionButton";
import { getCurrentUserId } from "../../common/session";
const FriendsPage = () => {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const currentUserId = getCurrentUserId();
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await getFriendsAPI();
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();

    const handler = () => fetchFriends();
    window.addEventListener("connection-updated", handler);

    return () => window.removeEventListener("connection-updated", handler);
  }, []);

  const removeConnection = async (connectionId) => {
    try {
      setProcessingId(connectionId);

      await removeConnectionAPI(connectionId);

      setFriends((prev) =>
        prev.filter((f) => f.connection_id !== connectionId),
      );
    } catch (err) {
      console.error("Error removing connection:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = (id) => {
    if (window.confirm("Remove this connection?")) {
      removeConnection(id);
    }
  };

  const safeFriends = Array.isArray(friends) ? friends : [];

  return (
    <div className="w-full  min-h-screen bg-white">
      {/* HEADER */}
      <div className="px-3  border-b">
        <div className="flex items-center justify-between">
          <h4 className="text-[16px] font-semibold">My Connections</h4>
          <div className="flex items-center gap-1 relative group">
            <button
              onClick={() => navigate("/dashboard/connections/requests")}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Connection Requests
            </button>

            <span className="text-[10px] text-gray-400 cursor-default">ⓘ</span>

            <div className="absolute right-0 top-6 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
              View and manage incoming requests
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          People you’re connected with
        </p>
      </div>

      {/* COUNT */}
      {!loading && safeFriends.length > 0 && (
        <p className="text-[11px] text-gray-500 px-3 py-1">
          {safeFriends.length} connection
          {safeFriends.length > 1 && "s"}
        </p>
      )}

      {/* LIST */}
      <div className="divide-y">
        {/* LOADING */}
        {loading && (
          <p className="text-xs text-gray-500 px-3 py-2">
            Fetching your connections...
          </p>
        )}

        {/* EMPTY */}
        {!loading && safeFriends.length === 0 && (
          <div className="px-3 py-6 text-center text-gray-500">
            <p className="text-sm">No connections yet</p>
            <p className="text-[11px] mt-1">
              Start connecting with people to see them here
            </p>
          </div>
        )}

        {/* USERS */}
        {!loading &&
          safeFriends.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center justify-between px-3 py-2"
            >
              {/* USER INFO */}
              <div
                onClick={() => navigate(`/dashboard/user/${user.user_id}`)}
                className="flex items-center gap-2 cursor-pointer min-w-0"
              >
                <img
                  src={user.profile_img || "/default.png"}
                  alt={user.fullname}
                  onError={(e) => (e.target.src = "/default.png")}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />

                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{user.fullname}</span>
                  <span className="text-[11px] text-gray-400">Connected</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <ConnectionButton
                  userId={user.user_id}
                  currentUserId={currentUserId}
                  forceStatus="connected"
                />

                <button
                  onClick={() => handleRemove(user.connection_id)}
                  disabled={processingId === user.connection_id}
                  className="text-[11px] px-2 py-1 text-red-500"
                >
                  {processingId === user.connection_id ? "..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FriendsPage;
