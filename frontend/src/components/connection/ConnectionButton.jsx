import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConversationAPI } from "../../api/chat.api";
import {
  sendConnectionRequestAPI,
  getFriendsAPI,
  getPendingRequestsAPI,
  acceptConnectionRequestAPI,
  rejectConnectionRequestAPI,
  getSentRequestsAPI,
} from "../../api/connection.api";

const ConnectionButton = ({
  userId,
  currentUserId,
  forceStatus,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("none"); // none | pending | received | connected
  const [connectionId, setConnectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // ================= STATUS CHECK =================
  useEffect(() => {
    // ✅ FORCE STATUS (for performance + control)
    if (forceStatus) {
      setStatus(forceStatus);
      setChecking(false);
      onStatusChange?.(forceStatus);
      return;
    }

    if (!currentUserId || userId === currentUserId) {
      setChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const [friendsRes, pendingRes, sentRes] = await Promise.all([
          getFriendsAPI(),
          getPendingRequestsAPI(),
          getSentRequestsAPI(),
        ]);

        const friends = friendsRes.data;
        const pending = pendingRes.data;
        const sent = sentRes.data;

        // ✅ CONNECTED
        if (friends.some((f) => String(f.user_id) === String(userId))) {
          setStatus("connected");
          onStatusChange?.("connected");
          setChecking(false);
          return;
        }

        // ✅ RECEIVED
        const received = pending.find(
          (p) => String(p.sender_id) === String(userId),
        );

        if (received) {
          setStatus("received");
          setConnectionId(received.connection_id);
          onStatusChange?.("received");
          setChecking(false);
          return;
        }

        // ✅ SENT
        const sentRequest = sent.find(
          (p) => String(p.receiver_id) === String(userId),
        );

        if (sentRequest) {
          setStatus("pending");
          setConnectionId(sentRequest.connection_id);
          onStatusChange?.("pending");
          setChecking(false);
          return;
        }

        // ✅ NONE
        setStatus("none");
        onStatusChange?.("none");
        setChecking(false);
      } catch (err) {
        console.error(err);
        setChecking(false);
      }
    };

    checkStatus();
  }, [userId, currentUserId, forceStatus]);

  // ================= ACTIONS =================

  const handleAdd = async () => {
    try {
      setLoading(true);
      await sendConnectionRequestAPI(userId);
      setStatus("pending");
      onStatusChange?.("pending");
    } catch (err) {
      alert("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptConnectionRequestAPI(connectionId);
      setStatus("connected");
      onStatusChange?.("connected");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectConnectionRequestAPI(connectionId);
      setStatus("none");
      onStatusChange?.("none");
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (e) => {
    e.stopPropagation();

    if (status !== "connected") return;

    try {
      const res = await createConversationAPI({
        userIds: [userId],
        isGroup: false,
      });

      navigate(`/chat/conversation/${res.data.conversation_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LOADING =================
  if (checking) {
    return (
      <div className="text-[11px] text-gray-400 px-3 py-1">Loading...</div>
    );
  }

  // ================= UI =================
  return (
    <div className="flex gap-2">
      {/* CONNECT */}
      {status === "none" && (
        <button
          onClick={handleAdd}
          disabled={loading}
          className="text-[11px] px-3 py-1 rounded-full bg-blue-500 text-white"
        >
          {loading ? "..." : "Connect"}
        </button>
      )}

      {/* REQUESTED */}
      {status === "pending" && (
        <button
          disabled
          className="text-[11px] px-3 py-1 rounded-full bg-gray-400 text-white"
        >
          Requested
        </button>
      )}

      {/* RECEIVED */}
      {status === "received" && (
        <>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="text-[11px] px-3 py-1 rounded-full bg-green-500 text-white"
          >
            Accept
          </button>

          <button
            onClick={handleReject}
            disabled={loading}
            className="text-[11px] px-3 py-1 rounded-full bg-red-500 text-white"
          >
            Reject
          </button>
        </>
      )}

      {/* CONNECTED */}
      {status === "connected" && (
        <button
          disabled
          className="text-[11px] px-3 py-1 rounded-full bg-green-600 text-white"
        >
          Connected
        </button>
      )}

      {/* MESSAGE */}
      <button
        disabled={status !== "connected"}
        onClick={handleMessage}
        className={`text-[11px] px-3 py-1 rounded-full text-white ${
          status === "connected"
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Message
      </button>
    </div>
  );
};

export default ConnectionButton;
