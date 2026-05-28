import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast from "react-hot-toast";
import { validatePasswordResetToken, resetPassword } from "../api/auth.api";
import Loader from "../components/loader.component";

import { KeyIcon } from "@heroicons/react/24/outline";
const ResetPasswordPage = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

  /** Verify token on page load */
  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
      return;
    }

    const verify = async () => {
      try {
        await validatePasswordResetToken({
          token,
        });
        setTokenValid(true); // mark token as valid
      } catch {
        toast.error("Invalid or expired reset link");
        setTokenValid(false); // mark token as invalid
        setTimeout(() => navigate("/forgot-password"), 2000); // redirect
      } finally {
        setVerifyingToken(false); // stop showing loader
      }
    };
    verify();
  }, [token, navigate]);

  /** Reset Password */
  const handleResetPassword = async () => {
    if (loading) return;

    const password = formRef.current.password.value.trim();
    const confirm = formRef.current.confirm_password.value.trim();

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must be at least 12 characters with uppercase, lowercase, number & special character",
      );
    }

    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await resetPassword({ token, password });
      toast.success("Password updated! Redirecting to login...");

      setTimeout(() => navigate("/signin"), 4000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleResetPassword();
  };

  /** Show loader while verifying token */
  if (verifyingToken) {
    return (
      <AnimationWrapper keyValue="reset-password">
        <div className="h-cover flex items-center justify-center">
          <Loader />
        </div>
      </AnimationWrapper>
    );
  }

  /** Block form if token is invalid */
  if (!tokenValid) {
    return (
      <AnimationWrapper keyValue="reset-password">
        <div className="h-cover flex flex-col items-center justify-center text-center px-4">
          <p className="text-red-500 text-xl mb-4">
            Invalid or expired reset link
          </p>
          <p className="text-gray-700 mb-6">
            Redirecting you to the Forgot Password page...
          </p>
          <Loader />
        </div>
      </AnimationWrapper>
    );
  }

  /** Form JSX */
  return (
    <AnimationWrapper keyValue="reset-password">
      <section className="bg-gray-50 min-h-full flex items-start justify-center px-4 pt-2 relative">
        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
            <Loader />
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="
          w-full max-w-md
          bg-white
          border border-gray-200
          rounded-2xl
          shadow-md
          p-6 sm:p-8
          flex flex-col
        "
          style={loading ? { pointerEvents: "none", opacity: 0.6 } : {}}
        >
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyIcon className="w-5 h-5" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Reset Password
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Enter your new password below
            </p>
          </div>

          {/* Password */}
          <InputBox
            name="password"
            type="password"
            placeholder="New Password"
            icon={<KeyIcon className="w-4 h-4" />}
            required
          />

          {/* Confirm Password */}
          <div className="mt-4">
            <InputBox
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              icon={<KeyIcon className="w-4 h-4" />}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            className="
            w-full mt-6
            bg-black text-white
            py-3 rounded-xl
            font-medium
            transition hover:opacity-90
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Choose a strong password for better security.
          </p>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ResetPasswordPage;
