import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../../App";
import { ADMIN_EXPENDITURE_API } from "../../../common/api";
import Loader from "../../../components/loader.component";

const AdminExpenditures = () => {
  const { userAuth } = useContext(UserContext);
  const token = userAuth?.access_token;

  // ================= STATE =================
  const [formData, setFormData] = useState({
    initiative: "",
    amount: "",
    invoice_number: "",
    by_whom: "",
    expense_details: "",
    evidence_copy_url: "",
  });

  const [expenditures, setExpenditures] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ================= FETCH HISTORY =================
  const fetchExpenditures = useCallback(async () => {
    if (!token) return;

    setFetching(true);

    try {
      const { data } = await axios.get(
        `${ADMIN_EXPENDITURE_API}/expenditure-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { year: yearFilter },
        },
      );

      setExpenditures(data?.expenditures || []);
    } catch (err) {
      console.error("Fetch expenditure error", err);
      toast.error("Failed to load expenditures");
    } finally {
      setFetching(false);
    }
  }, [token, yearFilter]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= ADD EXPENDITURE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.initiative || !formData.amount) {
      toast.error("Initiative and amount are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${ADMIN_EXPENDITURE_API}/add-expenditure`,
        {
          ...formData,
          amount: parseFloat(formData.amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Expenditure added");

      // ✅ reset form
      setFormData({
        initiative: "",
        amount: "",
        invoice_number: "",
        by_whom: "",
        expense_details: "",
        evidence_copy_url: "",
      });

      fetchExpenditures();
    } catch (err) {
      console.error("Add expenditure error", err);
      toast.error(err.response?.data?.error || "Failed to add expenditure");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Expenditures</h1>
        <p className="text-gray-500">Add and manage organization expenses</p>
      </div>

      {/* ================= ADD FORM ================= */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Add Expenditure</h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            name="initiative"
            value={formData.initiative}
            onChange={handleChange}
            placeholder="Initiative *"
            className="input"
            required
          />

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount *"
            className="input"
            required
          />

          <input
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            placeholder="Invoice Number"
            className="input"
          />

          <input
            name="by_whom"
            value={formData.by_whom}
            onChange={handleChange}
            placeholder="By Whom"
            className="input"
          />

          <input
            name="evidence_copy_url"
            value={formData.evidence_copy_url}
            onChange={handleChange}
            placeholder="Evidence URL"
            className="input md:col-span-2"
          />

          <textarea
            name="expense_details"
            value={formData.expense_details}
            onChange={handleChange}
            placeholder="Expense Details"
            className="input md:col-span-2"
            rows={3}
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-black text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader /> : "Add Expenditure"}
          </button>
        </form>
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500">Year:</label>
        <input
          type="number"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border rounded-lg px-3 py-1 w-28"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl border overflow-auto">
        {fetching ? (
          <div className="p-6 text-center">
            <Loader />
          </div>
        ) : !expenditures.length ? (
          <div className="p-6 text-center text-gray-500">
            No expenditures found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Date</th>
                <th>Initiative</th>
                <th>Amount</th>
                <th>By</th>
                <th>Invoice</th>
              </tr>
            </thead>

            <tbody>
              {expenditures.map((exp) => (
                <tr key={exp.expenditure_id} className="border-t">
                  <td className="p-3">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td>{exp.initiative}</td>
                  <td className="font-semibold">
                    ₹{Number(exp.amount).toLocaleString()}
                  </td>
                  <td>{exp.by_whom || "-"}</td>
                  <td>{exp.invoice_number || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminExpenditures;
