import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import Loader from "../loader.component";
import PaymentSuccess from "../payment/payment-success.component";
import { DONATION_API, PAYMENT_API } from "../../common/api";

const DonationForm = ({ onSuccess, donorProfile }) => {
  const { userAuth } = useContext(UserContext);

  const [formData, setFormData] = useState({
    amount: "",
    purpose: donorProfile?.purpose || "",
    customer_id: donorProfile?.customer_id || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDonation, setSuccessDonation] = useState(null);

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async (amount) => {
    const res = await loadRazorpayScript();
    if (!res) return setError("Razorpay SDK failed to load");

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) return setError("Razorpay key missing");

    let order;
    try {
      const { data } = await axios.post(
        `${PAYMENT_API}/create-order`,
        { amount },
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } },
      );
      order = data.order;
    } catch (e) {
      return setError("Order creation failed");
    }

    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: "INR",
      name: "REACH Foundation",
      description: `Donation for ${formData.purpose}`,
      order_id: order.id,

      handler: async (response) => {
        try {
          const verifyRes = await axios.post(
            `${PAYMENT_API}/verify`,
            response,
            { headers: { Authorization: `Bearer ${userAuth.access_token}` } },
          );

          if (!verifyRes.data.valid) {
            return setError("Verification failed");
          }

          const donationResponse = await axios.post(
            `${DONATION_API}/make-donation`,
            {
              ...formData,
              amount,
              payment_id: response.razorpay_payment_id,
            },
            {
              headers: { Authorization: `Bearer ${userAuth.access_token}` },
            },
          );

          setSuccessDonation(donationResponse.data.donation);
          setShowSuccess(true);
          onSuccess?.(donationResponse.data.donation);
        } catch {
          setError("Payment successful but recording failed");
        }
      },

      prefill: {
        name: userAuth.fullname,
        email: userAuth.email,
      },

      theme: { color: "#10b981" },
    };

    new window.Razorpay(options).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.amount || formData.amount <= 0) {
      return setError("Enter valid amount");
    }

    setLoading(true);
    await handlePayment(parseFloat(formData.amount));
    setLoading(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ SUCCESS STATE (INLINE — NOT MODAL)
  if (showSuccess) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <PaymentSuccess donation={successDonation} />
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4">
      {/* HEADER */}
      <div className="mb-2 px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold">Make a Donation</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Support causes that matter ❤️
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-2 sm:px-0">
        {/* AMOUNT */}
        <div>
          <label className="text-sm font-medium mb-1 block">Amount (₹)</label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <div className="flex gap-2 mt-2 flex-wrap">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, amount: amt.toString() })
                }
                className="px-3 py-1 text-sm border rounded-full"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* PURPOSE */}
        <div>
          <label className="text-sm font-medium mb-1 block">Purpose</label>

          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select cause</option>
            <option>Education for All</option>
            <option>Healthcare Support</option>
            <option>Disaster Relief</option>
            <option>Animal Welfare</option>
          </select>
        </div>

        {/* CUSTOMER ID */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Customer ID (Optional)
          </label>

          <input
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* INFO */}
        <div className="text-sm bg-blue-50 p-2 rounded">
          Your donation will be saved in your profile.
        </div>

        {/* DESKTOP BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="hidden md:block w-full p-3 bg-emerald-500 text-white rounded-lg"
        >
          {loading ? <Loader /> : `Donate ₹${formData.amount || 0}`}
        </button>
      </form>

      {/* ✅ MOBILE STICKY CTA (TRUE EDGE) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-white text-sm font-medium"
        >
          {loading ? "Processing..." : `Donate ₹${formData.amount || 0}`}
        </button>
      </div>
    </div>
  );
};
export default DonationForm;
