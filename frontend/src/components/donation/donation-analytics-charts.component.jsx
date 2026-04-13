import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import Loader from "../loader.component";
import { DONATION_API } from "../../common/api";
import {
  CurrencyRupeeIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
/* ================================
   SIMPLE BAR CHART
================================ */

const SimpleBarChart = ({ data, title, xKey, yKey }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-grey rounded-xl p-1">
        <h3 className="text-lg font-semibold text-dark-grey">{title}</h3>
        <div className="text-center text-dark-grey">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => parseFloat(item[yKey]) || 0));

  return (
    <div className="bg-white border border-grey rounded-xl p-6">
      <h3 className="text-lg font-semibold text-dark-grey mb-4">{title}</h3>

      <div className="space-y-3">
        {data.map((item, index) => {
          const value = parseFloat(item[yKey]) || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-dark-grey">{item[xKey]}</span>

                <span className="font-semibold text-emerald-600">
                  ₹{value.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-grey/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================================
   SIMPLE LINE CHART
================================ */

const SimpleLineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-grey rounded-xl p-1">
        <h3 className="text-lg font-semibold text-dark-grey mb-1">{title}</h3>
        <div className="text-center text-dark-grey">No data available</div>
      </div>
    );
  }

  const maxCumulative = Math.max(...data.map((item) => item.cumulative || 0));
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

          {/* Line */}

          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            points={data
              .map((item, index) => {
                const x =
                  data.length > 1 ? (index / (data.length - 1)) * 100 : 50;

                const y =
                  chartHeight -
                  ((item.cumulative || 0) / maxCumulative) * chartHeight;

                return `${x}%,${y}`;
              })
              .join(" ")}
          />

          {/* Points */}

          {data.map((item, index) => {
            const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;

            const y =
              chartHeight -
              ((item.cumulative || 0) / maxCumulative) * chartHeight;

            return (
              <circle key={index} cx={`${x}%`} cy={y} r="4" fill="#10b981" />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/* ================================
   MAIN ANALYTICS COMPONENT
================================ */

const DonationAnalyticsCharts = ({ selectedYear }) => {
  const { userAuth } = useContext(UserContext);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (userAuth?.access_token) {
      fetchAnalytics();
    }
  }, [userAuth?.access_token, selectedYear]);

  if (loading) return <Loader />;

  if (!analytics) {
    return (
      <div className="bg-white border border-grey rounded-xl p-6 text-center">
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Cumulative chart */}

      <SimpleLineChart
        data={analytics?.donationData}
        title="Cumulative Donations Over Time"
      />

      {/* Cause chart */}

      <SimpleBarChart
        data={analytics?.purposeTotals}
        title="Donations by Cause"
        xKey="purpose"
        yKey="total_amount"
      />

      {/* Subscription chart */}

      <SimpleBarChart
        data={analytics?.subscriptionTotals}
        title="Donations by Type"
        xKey="subscription_type"
        yKey="total_amount"
      />

      {/* Summary Cards */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {/* Total Donated */}
          <div className="flex flex-col items-center justify-center py-3 sm:p-5 bg-emerald-50">
            <CurrencyRupeeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mb-1" />

            <p className="text-[11px] sm:text-sm text-emerald-600">Total</p>

            <p className="text-sm sm:text-xl font-bold text-emerald-700 leading-tight">
              ₹{analytics?.totalDonated?.toLocaleString() || 0}
            </p>
          </div>

          {/* Total Donations */}
          <div className="flex flex-col items-center justify-center py-3 sm:p-5 bg-blue-50">
            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1" />

            <p className="text-[11px] sm:text-sm text-blue-600">Donations</p>

            <p className="text-sm sm:text-xl font-bold text-blue-700 leading-tight">
              {analytics?.donationData?.length || 0}
            </p>
          </div>

          {/* Top Cause */}
          <div className="flex flex-col items-center justify-center py-3 sm:p-5 bg-purple-50">
            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mb-1" />

            <p className="text-[11px] sm:text-sm text-purple-600">Top Cause</p>

            <p className="text-xs sm:text-lg font-bold text-purple-700 text-center leading-tight">
              {analytics?.purposeTotals?.[0]?.purpose || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationAnalyticsCharts;
