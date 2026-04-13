import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import Loader from "../loader.component";
import { PAYMENT_API } from "../../common/api";

const PaymentDetails = ({ paymentId, onClose }) => {
  const { userAuth } = useContext(UserContext);
  const token = userAuth?.access_token;

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(!!paymentId);
  const [error, setError] = useState("");

  // ===============================
  // FETCH FUNCTION (stable)
  // ===============================
  const fetchPaymentDetails = useCallback(
    async (signal) => {
      if (!paymentId || !token) return;

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${PAYMENT_API}/payment-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { payment_id: paymentId },
          signal,
        });

        setPaymentDetails(response.data);
      } catch (err) {
        if (err.name === "CanceledError" || axios.isCancel(err)) return;

        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch payment details",
        );
      } finally {
        setLoading(false);
      }
    },
    [paymentId, token],
  );

  // ===============================
  // EFFECT WITH PROPER CLEANUP
  // ===============================
  useEffect(() => {
    if (!paymentId || !token) return;

    setPaymentDetails(null);

    const controller = new AbortController();
    fetchPaymentDetails(controller.signal);

    return () => {
      controller.abort();
    };
  }, [paymentId, token, fetchPaymentDetails]);

  // ===============================
  // LOADING UI
  // ===============================
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {" "}
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          {" "}
          <Loader />{" "}
        </div>{" "}
      </div>
    );
  }

  // ===============================
  // ERROR UI
  // ===============================
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {" "}
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          {" "}
          <div className="text-red-500 mb-4">
            {" "}
            <i className="fi fi-rr-cross text-3xl"></i>{" "}
          </div>{" "}
          <h2 className="text-xl font-bold text-dark-grey mb-2">Error</h2>{" "}
          <p className="text-dark-grey mb-4">{error}</p>{" "}
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Close{" "}
          </button>{" "}
        </div>{" "}
      </div>
    );
  }

  if (!paymentDetails) return null;

  const donation = paymentDetails?.donation;
  const razorpay_details = paymentDetails?.razorpay_details;
  const bank_account_info = paymentDetails?.bank_account_info;

  const formattedAmount = donation?.amount
    ? Number(donation.amount).toLocaleString()
    : "0";

  // ===============================
  // MAIN UI
  // ===============================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {" "}
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}{" "}
        <div className="flex justify-between items-center mb-6">
          {" "}
          <h2 className="text-2xl font-bold text-dark-grey">
            Payment Details{" "}
          </h2>{" "}
          <button
            onClick={onClose}
            className="text-dark-grey hover:text-black text-xl"
          >
            {" "}
            <i className="fi fi-rr-cross"></i>{" "}
          </button>{" "}
        </div>
        <div className="space-y-6">
          {/* ================= Donation ================= */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Donation Information
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">Amount:</span>
                <span className="ml-2 font-bold">₹{formattedAmount}</span>
              </div>

              <div>
                <span className="text-green-600 font-medium">Purpose:</span>
                <span className="ml-2">{donation?.purpose || "-"}</span>
              </div>

              <div>
                <span className="text-green-600 font-medium">Date:</span>
                <span className="ml-2">
                  {donation?.date
                    ? new Date(donation.date).toLocaleDateString()
                    : "-"}
                </span>
              </div>

              <div>
                <span className="text-green-600 font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    donation?.payment_status === "completed"
                      ? "bg-green-100 text-green-800"
                      : donation?.payment_status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {donation?.payment_status || "pending"}
                </span>
              </div>
            </div>
          </div>

          {/* ================= Bank Info ================= */}
          {bank_account_info && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Bank Account Details
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600 font-medium">
                    Account Holder:
                  </span>
                  <span className="font-semibold">
                    {bank_account_info.account_holder}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-blue-600 font-medium">
                    Account Number:
                  </span>
                  <span className="font-mono">
                    {bank_account_info.account_number}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-blue-600 font-medium">IFSC:</span>
                  <span className="font-mono">
                    {bank_account_info.ifsc_code}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= Razorpay ================= */}
          {razorpay_details && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">
                Payment Method Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm capitalize">
                <div>
                  <span className="text-purple-600 font-medium">Method:</span>
                  <span className="ml-2">{razorpay_details.method}</span>
                </div>

                {razorpay_details.bank && (
                  <div>
                    <span className="text-purple-600 font-medium">Bank:</span>
                    <span className="ml-2">{razorpay_details.bank}</span>
                  </div>
                )}

                {razorpay_details.vpa && (
                  <div>
                    <span className="text-purple-600 font-medium">UPI:</span>
                    <span className="ml-2 font-mono">
                      {razorpay_details.vpa}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
