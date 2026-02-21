import { useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { useContext } from "react";
import Loader from "./loader.component";
import { PAYMENT_API } from "../common/api";

const PaymentDetails = ({ paymentId, onClose }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userAuth } = useContext(UserContext);

  useEffect(() => {
    if (paymentId && userAuth.access_token) {
      fetchPaymentDetails();
    }
  }, [paymentId, userAuth.access_token]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(`${PAYMENT_API}/payment-details`, {
        headers: {
          Authorization: `Bearer ${userAuth.access_token}`,
        },
        params: { payment_id: paymentId },
      });
      setPaymentDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch payment details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="text-red-500 mb-4">
            <i className="fi fi-rr-cross text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-dark-grey mb-2">Error</h2>
          <p className="text-dark-grey mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return null;
  }

  const { donation, razorpay_details, bank_account_info } = paymentDetails;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-grey">Payment Details</h2>
          <button
            onClick={onClose}
            className="text-dark-grey hover:text-black text-xl"
          >
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>

        <div className="space-y-6">
          {/* Donation Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Donation Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">Amount:</span>
                <span className="ml-2 font-bold">
                  ₹{donation.amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-green-600 font-medium">Purpose:</span>
                <span className="ml-2">{donation.purpose}</span>
              </div>
              <div>
                <span className="text-green-600 font-medium">Date:</span>
                <span className="ml-2">
                  {new Date(donation.date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-green-600 font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    donation.payment_status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {donation.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
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
                <span className="text-blue-600 font-medium">IFSC Code:</span>
                <span className="font-mono">{bank_account_info.ifsc_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Bank:</span>
                <span className="font-semibold">
                  {bank_account_info.bank_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Branch:</span>
                <span className="font-semibold">
                  {bank_account_info.branch}
                </span>
              </div>
            </div>
          </div>

          {/* Razorpay Payment Details */}
          {razorpay_details && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">
                Payment Method Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-600 font-medium">Method:</span>
                  <span className="ml-2 capitalize">
                    {razorpay_details.method}
                  </span>
                </div>
                {razorpay_details.bank && (
                  <div>
                    <span className="text-purple-600 font-medium">Bank:</span>
                    <span className="ml-2">{razorpay_details.bank}</span>
                  </div>
                )}
                {razorpay_details.wallet && (
                  <div>
                    <span className="text-purple-600 font-medium">Wallet:</span>
                    <span className="ml-2">{razorpay_details.wallet}</span>
                  </div>
                )}
                {razorpay_details.vpa && (
                  <div>
                    <span className="text-purple-600 font-medium">UPI ID:</span>
                    <span className="ml-2 font-mono">
                      {razorpay_details.vpa}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-purple-600 font-medium">
                    Razorpay Fee:
                  </span>
                  <span className="ml-2">
                    ₹
                    {razorpay_details.fee
                      ? (razorpay_details.fee / 100).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Tax:</span>
                  <span className="ml-2">
                    ₹
                    {razorpay_details.tax
                      ? (razorpay_details.tax / 100).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Status */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">
              Transfer Status
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-amber-600 font-medium">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  donation.transfer_status === "transferred"
                    ? "bg-green-100 text-green-800"
                    : donation.transfer_status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {donation.transfer_status}
              </span>
            </div>
            {donation.bank_account && (
              <div className="mt-2 text-sm">
                <span className="text-amber-600 font-medium">
                  Bank Account:
                </span>
                <span className="ml-2 font-mono">{donation.bank_account}</span>
              </div>
            )}
          </div>

          {/* Important Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Important Note:
            </h4>
            <p className="text-sm text-gray-600">
              All donations are processed through Razorpay and transferred to
              our verified bank account. You will receive a receipt via email,
              and the funds will be used for the specified cause.
            </p>
          </div>
        </div>

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
