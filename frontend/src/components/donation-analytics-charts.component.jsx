import { useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { useContext } from "react";
import Loader from "./loader.component";
import { DONATION_API } from "../common/api";

// Simple chart components without external library
const SimpleBarChart = ({ data, title, xKey, yKey }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-grey rounded-xl p-6">
        <h3 className="text-lg font-semibold text-dark-grey mb-4">{title}</h3>
        <div className="text-center text-dark-grey py-8">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => parseFloat(item[yKey])));

  return (
    <div className="bg-white border border-grey rounded-xl p-6">
      <h3 className="text-lg font-semibold text-dark-grey mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (parseFloat(item[yKey]) / maxValue) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-dark-grey">{item[xKey]}</span>
                <span className="font-semibold text-emerald-600">
                  ₹{parseFloat(item[yKey]).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-grey/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-grey rounded-xl p-6">
        <h3 className="text-lg font-semibold text-dark-grey mb-4">{title}</h3>
        <div className="text-center text-dark-grey py-8">No data available</div>
      </div>
    );
  }

  const maxCumulative = Math.max(...data.map((item) => item.cumulative));
  const chartHeight = 200;

  return (
    <div className="bg-white border border-grey rounded-xl p-6">
      <h3 className="text-lg font-semibold text-dark-grey mb-4">{title}</h3>
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent, i) => (
            <line
              key={i}
              x1="0"
              y1={(percent / 100) * chartHeight}
              x2="100%"
              y2={(percent / 100) * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Line chart */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            points={data
              .map((item, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y =
                  chartHeight - (item.cumulative / maxCumulative) * chartHeight;
                return `${x}%,${y}`;
              })
              .join(" ")}
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y =
              chartHeight - (item.cumulative / maxCumulative) * chartHeight;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={y}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-dark-grey">
          <span>₹{maxCumulative.toLocaleString()}</span>
          <span>₹{(maxCumulative * 0.75).toLocaleString()}</span>
          <span>₹{(maxCumulative * 0.5).toLocaleString()}</span>
          <span>₹{(maxCumulative * 0.25).toLocaleString()}</span>
          <span>₹0</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-dark-grey mt-2">
        {data.map((item, index) => (
          <span key={index} className="text-center">
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ))}
      </div>
    </div>
  );
};

const DonationAnalyticsCharts = ({ selectedYear }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userAuth } = useContext(UserContext);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${DONATION_API}/donation-analytics`, {
        headers: {
          Authorization: `Bearer ${userAuth.access_token}`,
        },
        params: { year: selectedYear },
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAuth.access_token) {
      fetchAnalytics();
    }
  }, [userAuth.access_token, selectedYear]);

  if (loading) {
    return <Loader />;
  }

  if (!analytics || analytics.donationData.length === 0) {
    return (
      <div className="bg-white border border-grey rounded-xl p-6">
        <h3 className="text-lg font-semibold text-dark-grey mb-4">
          Donation Analytics
        </h3>
        <div className="text-center text-dark-grey py-8">
          No donation data available for {selectedYear}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cumulative Donations Chart */}
      <SimpleLineChart
        data={analytics.donationData}
        title="Cumulative Donations Over Time"
      />

      {/* Donations by Purpose */}
      <SimpleBarChart
        data={analytics.purposeTotals}
        title="Donations by Cause"
        xKey="purpose"
        yKey="total_amount"
      />

      {/* Donations by Subscription Type */}
      <SimpleBarChart
        data={analytics.subscriptionTotals}
        title="Donations by Type"
        xKey="subscription_type"
        yKey="total_amount"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-emerald-600">Total Donated</p>
              <p className="text-xl font-bold text-emerald-700">
                ₹{analytics.totalDonated.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm text-blue-600">Total Donations</p>
              <p className="text-xl font-bold text-blue-700">
                {analytics.donationData.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm text-purple-600">Top Cause</p>
              <p className="text-lg font-bold text-purple-700">
                {analytics.purposeTotals[0]?.purpose || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationAnalyticsCharts;
