import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../../App";
import { ADMIN_FINANCE_API } from "../../../common/api";
import Loader from "../../../components/loader.component";

const AdminBalance = () => {
  const { userAuth } = useContext(UserContext);
  const token = userAuth?.access_token;

  // ================= STATE =================
  const [balanceAmount, setBalanceAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH HISTORY =================
  const fetchHistory = useCallback(async () => {
    if (!token) return;

    setFetching(true);
    setError("");

    try {
      const { data } = await axios.get(`${ADMIN_FINANCE_API}/balance-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { year: yearFilter },
      });

      setHistory(data?.balanceSnapshots || []);
    } catch (err) {
      console.error("Balance history error:", err);
      setError(err.response?.data?.error || "Failed to load balance history");
    } finally {
      setFetching(false);
    }
  }, [token, yearFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ================= ADD SNAPSHOT =================
  const handleAddSnapshot = async (e) => {
    e.preventDefault();

    if (!balanceAmount || Number(balanceAmount) < 0) {
      toast.error("Enter valid balance amount");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${ADMIN_FINANCE_API}/add-balance-snapshot`,
        {
          balance_amount: Number(balanceAmount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Balance snapshot added");
      setBalanceAmount("");
      fetchHistory();
    } catch (err) {
      console.error("Add balance error:", err);

      toast.error(
        err.response?.data?.error || "Failed to add balance snapshot",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Balance History</h1>
        <p className="text-gray-500">Record and review organization balance</p>
      </div>

      {/* ADD SNAPSHOT */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Add Balance Snapshot</h2>

        <form
          onSubmit={handleAddSnapshot}
          className="flex flex-col md:flex-row gap-3"
        >
          <input
            type="number"
            placeholder="Enter balance amount"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader /> : "Add Snapshot"}
          </button>
        </form>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500">Year:</label>
        <input
          type="number"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border rounded-lg px-3 py-1 w-28"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-auto">
        {fetching ? (
          <div className="p-6 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : !history.length ? (
          <div className="p-6 text-center text-gray-500">
            No balance records found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Date</th>
                <th>Year</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.snapshot_id} className="border-t">
                  <td className="p-3">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td>{item.year}</td>
                  <td className="font-semibold">
                    ₹{Number(item.balance_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBalance;
