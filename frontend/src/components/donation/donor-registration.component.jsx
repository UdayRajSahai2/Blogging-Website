import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import Loader from "../loader.component";
import { DONOR_API } from "../../common/api";

const DonorRegistration = ({ onSuccess }) => {
  const { userAuth } = useContext(UserContext);

  const [formData, setFormData] = useState({
    subscription_type: "one-time",
    purpose: "",
    customer_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const response = await axios.post(
        `${DONOR_API}/register-donor`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );

      setSuccess(true);
      onSuccess?.(response.data.donor);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUCCESS STATE (INLINE)
  if (success) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">🎉 You're a Donor!</h2>
        <p className="text-gray-500">
          Thank you for joining and making an impact.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Become a Donor</h1>
        <p className="text-sm text-gray-500">
          Start contributing to meaningful causes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* PURPOSE */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Default Cause
          </label>
          <p className="text-xs text-gray-500 mb-2">
            This will be used as your default donation purpose.
          </p>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-emerald-400"
          >
            <option value="" disabled>
              Select a cause
            </option>
            <option value="Education for All"> Education for All</option>
            <option value="Healthcare Support"> Healthcare Support</option>
            <option value="Disaster Relief">Disaster Relief</option>
            <option value="Animal Welfare">Animal Welfare</option>
          </select>
        </div>
        {/* SUBSCRIPTION */}
        <div>
          <div>
            <label className="text-sm font-medium block mb-2">
              Donation Type
            </label>
            <span className="text-xs text-gray-500">
              Choose how often you want to donate
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "subscription_type", value: "one-time" },
                  })
                }
                className={`flex-1 p-2 rounded-lg border text-sm ${
                  formData.subscription_type === "one-time"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                One-time
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "subscription_type", value: "repeated" },
                  })
                }
                className={`flex-1 p-2 rounded-lg border text-sm ${
                  formData.subscription_type === "repeated"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                Recurring
              </button>
            </div>
          </div>
        </div>
        {/* CUSTOMER ID */}
        <div>
          <label className="text-sm font-medium block mb-1">Customer ID</label>
          <input
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Optional"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* DESKTOP BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="hidden md:block w-full p-3 bg-emerald-500 text-white rounded-lg"
        >
          {loading ? <Loader /> : "Register as Donor"}
        </button>
      </form>

      {/* ✅ MOBILE STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-3 bg-emerald-500 text-white rounded-lg"
        >
          {loading ? "Processing..." : "Register as Donor"}
        </button>
      </div>
    </div>
  );
};

export default DonorRegistration;
