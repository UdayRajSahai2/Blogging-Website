import { useEffect, useState } from "react";
import PaymentDetails from "./payment-details.component";

const PaymentSuccess = ({ donation, onClose }) => {
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fi fi-rr-check text-2xl text-green-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-dark-grey mb-2">Payment Successful!</h2>
          <p className="text-dark-grey">Thank you for your generous donation</p>
        </div>

        {donation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-grey">Amount:</span>
                <span className="font-semibold text-green-600">₹{donation.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-grey">Purpose:</span>
                <span className="font-semibold">{donation.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-grey">Date:</span>
                <span className="font-semibold">{new Date(donation.date).toLocaleDateString()}</span>
              </div>
              {donation.payment_id && (
                <div className="flex justify-between">
                  <span className="text-dark-grey">Payment ID:</span>
                  <span className="font-mono text-xs">{donation.payment_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => setShowPaymentDetails(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            View Payment Details
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all"
          >
            Continue
          </button>
          <p className="text-xs text-dark-grey">
            This window will close automatically in 5 seconds
          </p>
        </div>

        {/* Payment Details Modal */}
        {showPaymentDetails && (
          <PaymentDetails
            paymentId={donation.payment_id}
            onClose={() => setShowPaymentDetails(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
