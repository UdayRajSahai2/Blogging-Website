import { useNavigate } from "react-router-dom";
import { ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const ApprovalPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  px-4 pt-2 pb-10">
      <div className="max-w-xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <ClockIcon className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-2 text-2xl font-bold text-center text-gray-900">
          Registration Successful
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Thank you for registering. Your account has been created and is
          currently awaiting administrator approval.
        </p>
        {/* Status */}
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Status: Under Review
          </p>
          <p className="mt-1 text-sm text-amber-700">
            We'll notify you by email once your account has been approved.
          </p>
        </div>
        {/* Next Steps */}
        <div className="mt-2">
          <h2 className="font-semibold text-gray-900 mb-4">
            What happens next?
          </h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-600">
                Admin will review your application.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-600">
                You'll receive an email when your account is approved.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-600">
                Once approved, you can sign in and start using the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate("/signin")}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
        >
          Go to Sign In
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Need help? Contact <span className="font-medium"> Support</span>
        </p>
      </div>
    </div>
  );
};

export default ApprovalPending;
