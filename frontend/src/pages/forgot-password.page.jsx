import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Loader from "../components/loader.component";
import { AUTH_API } from "../common/api";

const ForgotPasswordPage = () => {
  const formRef = useRef();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  /** Cleanup session if user leaves */
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("reset_email");
    };
  }, []);

  /** Cooldown timer */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /** Send OTP */
  const sendOtp = async () => {
    const email = formRef.current.email.value.trim();
    if (!email) return toast.error("Enter your email");

    setLoading(true);
    try {
      await axios.post(`${AUTH_API}/forgot-password`, { email });
      sessionStorage.setItem("reset_email", email);
      toast.success("OTP sent to your email");
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error("Too many attempts. Try again later.");
      } else {
        toast.error(err.response?.data?.error || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  /** Verify OTP */
  const verifyOtp = async () => {
    const email = sessionStorage.getItem("reset_email");
    if (!email) return toast.error("Session expired. Please try again.");

    if (!/^\d{6}$/.test(otp)) {
      return toast.error("OTP must be 6 digits");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${AUTH_API}/verify-password-email-otp`,
        { email, otp },
      );

      toast.success("OTP verified");
      navigate(`/reset-password?token=${data.resetToken}`);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error("Too many attempts. Try again later.");
      } else {
        toast.error(err.response?.data?.error || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  /** Submit handler */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    if (!otpSent) sendOtp();
    else verifyOtp();
  };

  return (
    <AnimationWrapper keyValue="forgot-password">
      <section className="min-h-screen w-full flex justify-center px-4 pt-16 pb-8 relative">
        <Toaster />

        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
            <Loader />
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full max-w-md shadow-sm p-6 sm:p-8 flex flex-col"
          style={loading ? { pointerEvents: "none", opacity: 0.6 } : {}}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-gelasio">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Enter your email to receive a verification OTP
            </p>
          </div>

          {/* Email */}
          <InputBox
            name="email"
            type="email"
            placeholder="Enter your email"
            icon="fi-rr-envelope"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={otpSent}
          />

          {/* OTP */}
          {otpSent && (
            <div className="mt-4">
              <InputBox
                name="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />

              <p className="text-xs text-gray-500 mt-2 text-center">
                Check your email for the OTP
              </p>
            </div>
          )}

          {/* Button */}
          <button
            className="btn-dark w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={cooldown > 0 && !otpSent}
          >
            {!otpSent
              ? cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Send OTP"
              : "Verify OTP"}
          </button>

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?
            <Link to="/signin" className="ml-1 underline text-black">
              Sign in
            </Link>
          </p>

          {/* Support */}
          <p className="text-center text-sm text-gray-500 mt-3">
            Need help?
            <Link to="/support" className="ml-1 underline">
              Contact support
            </Link>
          </p>

          {/* Security Notice */}
          <p className="text-center text-xs text-gray-400 mt-4">
            For security reasons, OTP expires in 5 minutes.
          </p>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ForgotPasswordPage;
