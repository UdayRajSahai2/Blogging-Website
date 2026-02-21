import { useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { useContext } from "react";
import Loader from "./loader.component";
import PaymentSuccess from "./payment-success.component";
import { DONATION_API, PAYMENT_API } from "../common/api";

const DonationForm = ({ onClose, onSuccess, donorProfile }) => {
  const [formData, setFormData] = useState({
    amount: "",
    purpose: donorProfile?.purpose || "",
    customer_id: donorProfile?.customer_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDonation, setSuccessDonation] = useState(null);
  const { userAuth } = useContext(UserContext);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (amount) => {
    const res = await loadRazorpayScript();
    if (!res) {
      setError("Razorpay SDK failed to load");
      return;
    }

    // Check if Razorpay key is set
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey === "rzp_test_1234567890") {
      setError(
        "Razorpay key not configured. Please set VITE_RAZORPAY_KEY_ID in your .env file",
      );
      return;
    }

    // 1) Create order on server
    let order;
    try {
      const { data } = await axios.post(
        `${PAYMENT_API}/create-order`,
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } },
      );
      order = data.order;
      if (!order?.id) throw new Error("Order creation failed");
    } catch (e) {
      console.error("Order creation error:", e);
      setError(
        e?.response?.data?.error ||
          "Failed to create payment order. Check server logs.",
      );
      return;
    }

    const options = {
      key: razorpayKey,
      amount: order.amount, // Amount in paise from order
      currency: "INR",
      name: "Connect Me",
      description: `Donation for ${formData.purpose}`,
      image: "/logo.png",
      order_id: order.id,
      handler: async function (response) {
        console.log("Payment success response:", response);

        // 2) Verify signature on server
        try {
          const verifyRes = await axios.post(
            `${PAYMENT_API}/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${userAuth.access_token}` } },
          );

          if (!verifyRes.data?.valid) {
            setError("Payment verification failed");
            return;
          }

          // 3) Record donation only after verification
          try {
            const donationResponse = await axios.post(
              `${DONATION_API}/make-donation`,
              {
                ...formData,
                amount: parseFloat(formData.amount),
                payment_id: response.razorpay_payment_id,
                payment_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${userAuth.access_token}`,
                },
              },
            );

            if (donationResponse.data.message) {
              setSuccessDonation(donationResponse.data.donation);
              setShowSuccess(true);
              onSuccess(donationResponse.data.donation);
            }
          } catch (err) {
            console.error("Donation recording error:", err);
            setError(
              err.response?.data?.error ||
                "Payment successful but failed to record donation",
            );
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          setError("Payment verification failed");
        }
      },
      prefill: {
        name: userAuth.fullname || "",
        email: userAuth.email || "",
      },
      theme: {
        color: "#10b981",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      console.error("Payment failed:", response);
      setError(
        `Payment failed: ${response.error.description || "Unknown error"}`,
      );
    });
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate amount
      if (!formData.amount || formData.amount <= 0) {
        setError("Please enter a valid donation amount");
        setLoading(false);
        return;
      }

      // Initiate payment
      await handlePayment(parseFloat(formData.amount));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process donation");
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

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-grey">Make a Donation</h2>
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
              Donation Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="1"
              step="1"
              className="w-full p-3 border border-grey rounded-lg focus:border-black focus:outline-none"
              required
            />

            {/* Quick amount buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, amount: amount.toString() })
                  }
                  className="px-3 py-1 text-sm border border-grey rounded-full hover:bg-grey/10 transition-colors"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">
              Purpose/Cause
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
              <option value="Environmental Protection">
                Environmental Protection
              </option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Community Development">
                Community Development
              </option>
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
              placeholder="Enter your customer ID"
              className="w-full p-3 border border-grey rounded-lg focus:border-black focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <i className="fi fi-rr-info mr-2"></i>
              This donation will be recorded and you can view your donation
              history in your profile.
            </p>
          </div>

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
              {loading ? <Loader /> : `Donate ₹${formData.amount || 0}`}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Success Modal */}
      {showSuccess && (
        <PaymentSuccess
          donation={successDonation}
          onClose={() => {
            setShowSuccess(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default DonationForm;
