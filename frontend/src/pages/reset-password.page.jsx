import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Loader from "../components/loader.component";
import { AUTH_API } from "../common/api";

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
        await axios.post(`${AUTH_API}/validate-password-reset-token`, {
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
  const resetPassword = async () => {
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
      await axios.post(`${AUTH_API}/reset-password`, { token, password });
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
    resetPassword();
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
      <section className="h-auto flex items-center justify-center relative">
        <Toaster />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
            <Loader />
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-[80%] max-w-[400px]"
          style={loading ? { pointerEvents: "none", opacity: 0.6 } : {}}
        >
          <h1 className="text-4xl font-gelasio text-center mb-20">
            Reset Password
          </h1>

          <InputBox
            name="password"
            type="password"
            placeholder="New Password"
            icon="fi-rr-key"
            required
          />

          <InputBox
            name="confirm_password"
            type="password"
            placeholder="Confirm Password"
            icon="fi-rr-key"
            required
          />

          <button
            className="btn-dark center mt-14"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ResetPasswordPage;
