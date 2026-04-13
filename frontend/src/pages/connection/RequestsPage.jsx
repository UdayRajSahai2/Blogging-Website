import { useEffect, useState } from "react";
import {
  getPendingRequestsAPI,
  acceptConnectionRequestAPI,
  rejectConnectionRequestAPI,
  getSentRequestsAPI,
} from "../../api/connection.api";

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const [incomingRes, sentRes] = await Promise.all([
        getPendingRequestsAPI(),
        getSentRequestsAPI(),
      ]);

      setRequests(Array.isArray(incomingRes.data) ? incomingRes.data : []);
      setSentRequests(Array.isArray(sentRes.data) ? sentRes.data : []);
    } catch (err) {
      console.error(err);
      setRequests([]);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id) => {
    try {
      setProcessingId(id);
      await acceptConnectionRequestAPI(id);

      setRequests((prev) => prev.filter((r) => r.connection_id !== id));

      window.dispatchEvent(new Event("connection-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    try {
      setProcessingId(id);
      await rejectConnectionRequestAPI(id);

      setRequests((prev) => prev.filter((r) => r.connection_id !== id));

      window.dispatchEvent(new Event("connection-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const safeIncoming = Array.isArray(requests) ? requests : [];
  const safeSent = Array.isArray(sentRequests) ? sentRequests : [];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* HEADER */}
      <div className="px-3 py-0 border-b">
        <h4 className="text-[16px] font-semibold m-0 leading-tight">
          Connection Requests
        </h4>
        <p className="text-[11px] text-gray-500">
          Manage people who want to connect with you
        </p>
      </div>

      {/* COUNT */}
      {!loading && safeIncoming.length > 0 && (
        <p className="text-[11px] text-gray-500 px-3 py-1">
          {safeIncoming.length} pending request
          {safeIncoming.length > 1 && "s"}
        </p>
      )}

      <div className="divide-y">
        {/* LOADING */}
        {loading && (
          <p className="text-xs text-gray-500 px-3 py-2">Loading requests...</p>
        )}

        {/* ================= INCOMING ================= */}
        {!loading && (
          <>
            {/* SECTION LABEL */}
            <div className="px-3 py-1 text-[11px] text-gray-400">Incoming</div>

            {safeIncoming.length === 0 && (
              <div className="px-3 py-4 text-gray-500 text-xs">
                No one has requested to connect yet
              </div>
            )}

            {safeIncoming.map((req) => (
              <div
                key={req.connection_id}
                className="flex items-center justify-between px-3 py-2"
              >
                {/* USER */}
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={req.sender?.profile_img || "/default.png"}
                    alt={req.sender?.fullname}
                    onError={(e) => (e.target.src = "/default.png")}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate">
                      {req.sender?.fullname || "Unknown"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Wants to connect
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-1">
                  <button
                    disabled={processingId === req.connection_id}
                    onClick={() => accept(req.connection_id)}
                    className="text-[11px] px-2 py-1 bg-green-500 text-white rounded"
                  >
                    {processingId === req.connection_id ? "..." : "Accept"}
                  </button>

                  <button
                    disabled={processingId === req.connection_id}
                    onClick={() => reject(req.connection_id)}
                    className="text-[11px] px-2 py-1 bg-gray-200 rounded"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ================= SENT ================= */}
        {!loading && (
          <>
            <div className="px-3 py-1 text-[11px] text-gray-400">Sent</div>

            {safeSent.length === 0 && (
              <div className="px-3 py-4 text-gray-500 text-xs">
                You haven’t sent any requests yet
              </div>
            )}

            {safeSent.map((req) => (
              <div
                key={req.connection_id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={req.receiver?.profile_img || "/default.png"}
                    alt={req.receiver?.fullname}
                    onError={(e) => (e.target.src = "/default.png")}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate">
                      {req.receiver?.fullname || "Unknown"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Request sent
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-gray-400">Pending</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
