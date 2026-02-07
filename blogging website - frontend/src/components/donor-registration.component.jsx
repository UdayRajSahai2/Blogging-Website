import { useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { useContext } from "react";
import Loader from "./loader.component";

const DonorRegistration = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subscription_type: "one-time",
    purpose: "",
    customer_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { userAuth } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/register-donor",
        formData,
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      if (response.data.message) {
        onSuccess(response.data.donor);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register as donor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-grey">Become a Donor</h2>
          <button
            onClick={onClose}
            className="text-dark-grey hover:text-black text-xl"
          >
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">
              Subscription Type
            </label>
            <select
              name="subscription_type"
              value={formData.subscription_type}
              onChange={handleChange}
              className="w-full p-3 border border-grey rounded-lg focus:border-black focus:outline-none"
              required
            >
              <option value="one-time">One-time Donation</option>
              <option value="repeated">Regular/Recurring Donation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">
              Default Purpose/Cause
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full p-3 border border-grey rounded-lg focus:border-black focus:outline-none"
              required
            >
              <option value="">Select a cause</option>
              <option value="Save Girl Child">Save Girl Child</option>
              <option value="Education for All">Education for All</option>
              <option value="Healthcare Support">Healthcare Support</option>
              <option value="Environmental Protection">Environmental Protection</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Community Development">Community Development</option>
              <option value="Animal Welfare">Animal Welfare</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">
              Customer ID (Optional)
            </label>
            <input
              type="text"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              placeholder="Enter your customer ID if you have one"
              className="w-full p-3 border border-grey rounded-lg focus:border-black focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-grey rounded-lg text-dark-grey hover:bg-grey/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50"
            >
              {loading ? <Loader /> : "Register as Donor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistration;
