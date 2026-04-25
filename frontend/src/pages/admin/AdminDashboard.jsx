import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import Card from "../../components/admin/AdminStatCard";
import { UserContext } from "../../App";
import { ADMIN_API } from "../../common/api";

const AdminDashboard = () => {
  const { userAuth } = useContext(UserContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   *  Fetch admin stats
   */
  const fetchStats = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`${ADMIN_API}/stats`, {
          headers: {
            Authorization: `Bearer ${userAuth?.access_token}`,
          },
          signal, //  request cancellation
        });

        setStats(data?.data || null);
      } catch (err) {
        if (axios.isCancel(err)) return;

        console.error("Admin stats error:", err);

        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to view admin stats.");
        } else {
          setError("Failed to load dashboard stats.");
        }
      } finally {
        setLoading(false);
      }
    },
    [userAuth?.access_token],
  );

  /**
   * Effect with cleanup (enterprise pattern)
   */
  useEffect(() => {
    if (!userAuth?.access_token) return;

    const controller = new AbortController();
    fetchStats(controller.signal);

    return () => controller.abort(); // ✅ prevent memory leak
  }, [fetchStats, userAuth?.access_token]);

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  /**
   * Error state with retry
   */
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  /**
   * Empty state safeguard
   */
  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-500">No data available.</div>
    );
  }

  /**
   * Success UI
   */
  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/*  MAIN STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card title="Users" value={stats.totalUsers ?? 0} />
        <Card title="Blogs" value={stats.totalBlogs ?? 0} />
        <Card title="Comments" value={stats.totalComments ?? 0} />
        <Card title="Donations" value={stats.totalDonations ?? 0} />
      </div>

      {/*  ROLE STATS */}
      <h1 className="text-2xl font-bold  mb-6">Access Control</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card title="Total Roles" value={stats.totalRoles ?? 0} />
        <Card
          title="Pending Approvals"
          value={stats.pendingRoleRequests ?? 0}
        />
        <Card title="Assigned Roles" value={stats.assignedRoles ?? 0} />
      </div>
    </div>
  );
};

export default AdminDashboard;
