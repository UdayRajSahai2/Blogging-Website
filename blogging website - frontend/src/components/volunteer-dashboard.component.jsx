import { useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { useContext } from "react";
import Loader from "./loader.component";
import DonorRegistration from "./donor-registration.component";
import DonationForm from "./donation-form.component";
import DonationAnalyticsCharts from "./donation-analytics-charts.component";

const VolunteerDashboard = () => {
  const [donorProfile, setDonorProfile] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { userAuth } = useContext(UserContext);

  const fetchDonorProfile = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/donor-profile",
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
      setDonorProfile(response.data.donor);
    } catch (err) {
      if (err.response?.status === 404) {
        setDonorProfile(null);
      }
    }
  };

  const fetchDonationHistory = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/donation-history",
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
          params: { year: selectedYear, limit: 20 }
        }
      );
      setDonationHistory(response.data.donations);
    } catch (err) {
      console.error("Error fetching donation history:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/donation-analytics",
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
          params: { year: selectedYear }
        }
      );
      setAnalytics(response.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  useEffect(() => {
    if (userAuth.access_token) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchDonorProfile(),
          fetchDonationHistory(),
          fetchAnalytics()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [userAuth.access_token, selectedYear]);

  const handleRegistrationSuccess = (donor) => {
    setDonorProfile(donor);
    setShowRegistration(false);
    fetchDonationHistory();
    fetchAnalytics();
  };

  const handleDonationSuccess = (donation) => {
    setShowDonationForm(false);
    fetchDonationHistory();
    fetchAnalytics();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-grey">Volunteer & Donor Dashboard</h2>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border border-grey rounded-lg text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donor Status */}
      {!donorProfile ? (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🤝</span>
            <div>
              <h3 className="text-xl font-semibold text-emerald-800">Become a Donor</h3>
              <p className="text-emerald-600">Join our community of volunteers and donors</p>
            </div>
          </div>
          <button
            onClick={() => setShowRegistration(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all"
          >
            Register as Donor
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-xl font-semibold text-blue-800">Registered Donor</h3>
                <p className="text-blue-600">
                  {donorProfile.subscription_type === "repeated" ? "Regular" : "One-time"} donor
                </p>
                <p className="text-blue-600 text-sm">Default cause: {donorProfile.purpose}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDonationForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all text-sm"
            >
              Make Donation
            </button>
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-grey rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm text-dark-grey">Total Donated ({selectedYear})</p>
                <p className="text-xl font-bold text-emerald-600">₹{analytics.totalDonated.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-grey rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm text-dark-grey">Donations Count</p>
                <p className="text-xl font-bold text-blue-600">{analytics.donationData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-grey rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm text-dark-grey">Top Cause</p>
                <p className="text-lg font-bold text-purple-600">
                  {analytics.purposeTotals[0]?.purpose || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation History */}
      {donationHistory.length > 0 && (
        <div className="bg-white border border-grey rounded-xl p-6">
          <h3 className="text-lg font-semibold text-dark-grey mb-4">Recent Donations</h3>
          <div className="space-y-3">
            {donationHistory.slice(0, 5).map((donation, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-grey/10 rounded-lg">
                <div>
                  <p className="font-medium">{donation.purpose}</p>
                  <p className="text-sm text-dark-grey">
                    {new Date(donation.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">₹{donation.amount.toLocaleString()}</p>
                  <p className="text-xs text-dark-grey">
                    {donation.donor.subscription_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && analytics.donationData.length > 0 && (
        <DonationAnalyticsCharts selectedYear={selectedYear} />
      )}

      {/* Purpose Breakdown */}
      {analytics?.purposeTotals && analytics.purposeTotals.length > 0 && (
        <div className="bg-white border border-grey rounded-xl p-6">
          <h3 className="text-lg font-semibold text-dark-grey mb-4">Donations by Cause</h3>
          <div className="space-y-3">
            {analytics.purposeTotals.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-dark-grey">{item.purpose}</span>
                <span className="font-semibold text-emerald-600">
                  ₹{parseFloat(item.total_amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showRegistration && (
        <DonorRegistration
          onClose={() => setShowRegistration(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showDonationForm && (
        <DonationForm
          onClose={() => setShowDonationForm(false)}
          onSuccess={handleDonationSuccess}
          donorProfile={donorProfile}
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;
