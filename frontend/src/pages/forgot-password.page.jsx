import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <section className="h-96 flex items-center justify-center relative">
        <Toaster />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
            <Loader />
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-[80%] max-w-[400px] flex flex-col"
          style={loading ? { pointerEvents: "none", opacity: 0.6 } : {}}
        >
          <h1 className="text-4xl font-gelasio text-center mb-10">
            Forgot Password
          </h1>

          <div className="flex flex-col gap-4">
            <InputBox
              name="email"
              type="email"
              placeholder="Enter your email"
              icon="fi-rr-envelope"
              value={email} // controlled input
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpSent}
            />

            {otpSent && (
              <InputBox
                name="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp} // controlled input
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            )}
          </div>

          <button
            className="btn-dark center mt-8"
            type="submit"
            disabled={cooldown > 0 && !otpSent}
          >
            {!otpSent
              ? cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Send OTP"
              : "Verify OTP"}
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ForgotPasswordPage;
