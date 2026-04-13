import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { UserContext } from "../../../App";
import { ADMIN_FINANCE_API } from "../../../common/api";
import Loader from "../../../components/loader.component";

const AdminFinance = () => {
  const { userAuth } = useContext(UserContext);
  const token = userAuth?.access_token;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          `${ADMIN_FINANCE_API}/financial-summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSummary(data);
      } catch (err) {
        console.error("Finance summary error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader />
      </div>
    );
  }

  if (!summary) {
    return <div className="p-6">No finance data available</div>;
  }

  // ================= DATA PREP =================

  const overviewData = [
    {
      name: "Donations",
      amount: Number(summary.totalDonations || 0),
    },
    {
      name: "Expenditures",
      amount: Number(summary.totalExpenditures || 0),
    },
  ];

  const donationsByPurpose =
    summary.donationsByPurpose?.map((d) => ({
      name: d.purpose || "Unknown",
      value: Number(d.total_amount),
    })) || [];

  const expendituresByInitiative =
    summary.expendituresByInitiative?.map((e) => ({
      name: e.initiative || "Unknown",
      value: Number(e.total_amount),
    })) || [];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  // ================= UI =================
  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Financial Summary</h1>
        <p className="text-gray-500">Donations vs expenditures overview</p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Donations" value={summary.totalDonations} />
        <StatCard title="Total Spent" value={summary.totalExpenditures} />
        <StatCard title="Current Balance" value={summary.currentBalance} />
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Donations vs Expenditures</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overviewData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= PIE CHARTS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Donations by purpose */}
        <PieBlock
          title="Donations by Purpose"
          data={donationsByPurpose}
          colors={COLORS}
        />

        {/* Expenditures by initiative */}
        <PieBlock
          title="Expenditures by Initiative"
          data={expendituresByInitiative}
          colors={COLORS}
        />
      </div>
    </div>
  );
};

export default AdminFinance;

// ================= SMALL COMPONENTS =================

const StatCard = ({ title, value }) => (
  <div className="bg-white border rounded-xl p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold">₹{Number(value || 0).toLocaleString()}</p>
  </div>
);

const PieBlock = ({ title, data }) => {
  if (!data.length) {
    return (
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold mb-4">{title}</h2>
        <p className="text-gray-400 text-sm">No data</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-5">
      <h2 className="font-semibold mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          />
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
