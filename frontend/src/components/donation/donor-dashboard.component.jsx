import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import Loader from "../loader.component";
import DonorRegistration from "./donor-registration.component";
import DonationForm from "./donation-form.component";
import DonationAnalyticsCharts from "./donation-analytics-charts.component";
import { DONATION_API, DONOR_API } from "../../common/api";
import { useLocation } from "react-router-dom";
import {
  CurrencyRupeeIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const DonorDashboard = () => {
  const { userAuth } = useContext(UserContext);

  const [donorProfile, setDonorProfile] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const location = useLocation();
  const [view, setView] = useState(location.state?.view || "dashboard");
  // ================= FETCH =================
  const fetchDonorProfile = async () => {
    try {
      const res = await axios.get(`${DONOR_API}/donor-profile`, {
        headers: { Authorization: `Bearer ${userAuth.access_token}` },
      });
      setDonorProfile(res.data.donor);
    } catch (err) {
      if (err.response?.status === 404) setDonorProfile(null);
    }
  };

  const fetchDonationHistory = async () => {
    try {
      const res = await axios.get(`${DONATION_API}/donation-history`, {
        headers: { Authorization: `Bearer ${userAuth.access_token}` },
        params: { year: selectedYear, limit: 20 },
      });
      setDonationHistory(res.data.donations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${DONATION_API}/donation-analytics`, {
        headers: { Authorization: `Bearer ${userAuth.access_token}` },
        params: { year: selectedYear },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (!loading) {
      if (!donorProfile) {
        setView("dashboard"); // shows register card
      } else {
        setView("dashboard"); // shows donor UI
      }
    }
  }, [loading, donorProfile]);
  useEffect(() => {
    if (userAuth.access_token) {
      const load = async () => {
        setLoading(true);
        await Promise.all([
          fetchDonorProfile(),
          fetchDonationHistory(),
          fetchAnalytics(),
        ]);
        setLoading(false);
      };
      load();
    }
  }, [userAuth.access_token, selectedYear]);

  // ================= HANDLERS =================
  const handleRegistrationSuccess = (donor) => {
    setDonorProfile(donor);
    setView("dashboard");
    fetchDonationHistory();
    fetchAnalytics();
  };

  const handleDonationSuccess = () => {
    setView("dashboard");
    fetchDonationHistory();
    fetchAnalytics();
  };

  // ================= VIEW SWITCH =================
  if (view === "register") {
    return (
      <div className="p-1">
        <button
          onClick={() => setView("dashboard")}
          className="mb-0 text-sm text-gray-500"
        >
          ← Back
        </button>

        <DonorRegistration onSuccess={handleRegistrationSuccess} />
      </div>
    );
  }

  if (view === "donate") {
    return (
      <div className="p-1">
        <button
          onClick={() => setView("dashboard")}
          className="mb-0 text-sm text-gray-500"
        >
          ← Back
        </button>

        <DonationForm
          donorProfile={donorProfile}
          onSuccess={handleDonationSuccess}
        />
      </div>
    );
  }

  // ================= LOADING =================
  if (loading) return <Loader />;

  // ================= MAIN DASHBOARD =================
  return (
    <div className="w-full max-w-full mx-auto px-0.5 space-y-2">
      <div className="rounded-xl border bg-blue-50 p-3 sm:p-4 space-y-3">
        {/* 🔝 HEADER INSIDE CARD */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-xl font-semibold">Donor Dashboard</h1>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              Showing data for:
            </span>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(+e.target.value)}
              className="text-xs sm:text-sm px-2 py-1 border rounded-md bg-white"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i,
              ).map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 💚 STATUS */}
        {!donorProfile ? (
          <div className="rounded-lg border bg-white/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* LEFT TEXT */}
            <div className="space-y-0.5 max-w-md">
              <h3 className="font-semibold text-sm sm:text-base">
                Make your contribution
              </h3>

              <p className="text-xs sm:text-sm text-gray-600">
                Create your donor profile and support causes you care about.
              </p>
            </div>

            {/* BUTTON */}
            <button
              onClick={() => setView("register")}
              className="mt-1 sm:mt-0 bg-emerald-500 hover:bg-emerald-600 transition text-white py-2 px-4 rounded-lg text-sm font-medium w-full sm:w-fit"
            >
              Create donor profile
            </button>
          </div>
        ) : (
          <div className="rounded-md border bg-white/60 p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* LEFT */}
            <div className="flex items-start gap-3 min-w-0">
              {/* PROFILE IMAGE */}
              <div className="w-16 h-16 sm:w-16 sm:h-16 mt-0.5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {userAuth?.profile_img ? (
                  <img
                    src={userAuth.profile_img}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-semibold">
                    {userAuth?.fullname?.charAt(0) || "D"}
                  </div>
                )}
              </div>

              {/* TEXT CONTENT */}
              <div className="min-w-0 space-y-1">
                <h4 className="font-semibold text-sm sm:text-base truncate">
                  Hi {userAuth?.fullname || "Donor"}
                </h4>

                <p className="text-xs text-gray-600 flex items-center gap-1 flex-wrap">
                  You are a
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium capitalize">
                    {donorProfile.subscription_type === "repeated"
                      ? "regular"
                      : "one-time"}
                  </span>
                  donor
                </p>

                <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                  Default cause:
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                    {donorProfile.purpose || "General"}
                  </span>
                </p>
              </div>
            </div>

            {/* RIGHT CTA */}
            <button
              onClick={() => setView("donate")}
              className="w-full sm:w-auto bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              Make a donation
            </button>
          </div>
        )}
      </div>

      {/* 📊 ANALYTICS CARDS */}
      {analytics && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border rounded-lg p-3 text-center">
            <CurrencyRupeeIcon className="w-5 h-5 mx-auto text-emerald-600" />
            <p className="text-[10px] text-gray-500 mt-1">Total</p>
            <p className="text-sm font-semibold text-emerald-600">
              ₹{analytics.totalDonated.toLocaleString()}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <ChartBarIcon className="w-5 h-5 mx-auto text-blue-600" />
            <p className="text-[10px] text-gray-500 mt-1">Donations</p>
            <p className="text-sm font-semibold text-blue-600">
              {analytics.donationData.length}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <SparklesIcon className="w-5 h-5 mx-auto text-purple-600" />
            <p className="text-[10px] text-gray-500 mt-1">Top</p>
            <p className="text-sm font-semibold text-purple-600 truncate">
              {analytics.purposeTotals[0]?.purpose || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* 📜 HISTORY */}
      <div className="bg-white border rounded-xl p-3 sm:p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-dark-grey mb-1">
            Recent Donations
          </h3>
        </div>

        {!donationHistory.length ? (
          <p className="text-xs text-gray-500">
            No donations for {selectedYear}
          </p>
        ) : (
          <div className="divide-y">
            {donationHistory.slice(0, 5).map((d, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{d.purpose}</p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(d.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    ₹{d.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {d.donor?.subscription_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📈 CHART */}
      <div className="bg-white border rounded-xl p-3 sm:p-5">
        <DonationAnalyticsCharts selectedYear={selectedYear} />
      </div>
    </div>
  );
};

export default DonorDashboard;
