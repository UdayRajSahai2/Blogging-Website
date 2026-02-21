import { useContext, useRef, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import Loader from "../components/loader.component";
import { AUTH_API } from "../common/api";

const UserAuthForm = ({ type }) => {
  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);
  const formElement = useRef();

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState({ latitude: null, longitude: null });
  const [customerId, setCustomerId] = useState("");
  const [abbr, setAbbr] = useState("");

  const serverRoute = type === "sign-in" ? "/signin" : "/signup";

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
  const mobileRegex = /^[+]?[0-9]{10,15}$/;

  // Get user geolocation (optional for sign-in, required for signup)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setGeo({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () =>
          type !== "sign-in" &&
          toast.error("Location access is required for signup."),
      );
    } else if (type !== "sign-in") {
      toast.error("Geolocation not supported by your browser.");
    }
  }, [type]);

  /** ---------------- Signin / Signup ---------------- */
  const userAuthThroughServer = async (serverRoute, formData) => {
    const loadingToast = toast.loading("Authenticating...");
    try {
      const { data } = await axios.post(AUTH_API + serverRoute, formData);
      toast.dismiss(loadingToast);
      storeInSession("user", JSON.stringify(data));
      setUserAuth(data);
      if (data.customer_id) {
        setCustomerId(data.customer_id);
        setAbbr(data.abbr || "");
        toast.success(`Your Customer ID: ${data.customer_id}`);
      }
      toast.success(`Welcome ${data.first_name || data.fullname || "User"}!`);
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.error || "Authentication failed";

      // Special handling for sign-in location required
      if (
        type === "sign-in" &&
        errorMsg.toLowerCase().includes("location") &&
        errorMsg.toLowerCase().includes("customer")
      ) {
        toast("Sign-in requires your location to generate a customer ID.", {
          icon: "📍",
        });
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) =>
              userAuthThroughServer(serverRoute, {
                ...formData,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            () =>
              toast.error(
                "Location permission denied. Sign-in requires location.",
              ),
          );
        } else {
          toast.error("Geolocation not supported by your browser.");
        }
      } else {
        toast.error(errorMsg);
      }
    }
  };

  /** ---------------- Handle Form Submit ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formElement.current ||
      !(formElement.current instanceof HTMLFormElement)
    )
      return toast.error("Form error.");

    const form = new FormData(formElement.current);
    const formData = Object.fromEntries(form.entries());

    const { first_name, last_name, email, password, mobile_number } = formData;

    // Sign-up specific checks
    if (type !== "sign-in") {
      if (!first_name) return toast.error("First name required");
      if (!last_name) return toast.error("Last name required");
      if (mobile_number && !mobileRegex.test(mobile_number))
        return toast.error("Mobile number invalid");
      if (!geo.latitude || !geo.longitude)
        return toast.error("Location required for signup");
      if (!passwordRegex.test(password))
        return toast.error(
          "Password must have 12+ chars, uppercase, lowercase, number & symbol",
        );
    } else {
      // Sign-in: just check non-empty
      if (!password) return toast.error("Password required");
    }

    // Email validation (both signup/sign-in)
    if (!email || !emailRegex.test(email)) return toast.error("Email invalid");

    // Server authentication
    userAuthThroughServer(serverRoute, {
      ...formData,
      latitude: geo.latitude,
      longitude: geo.longitude,
      type,
    });
  };

  /** ---------------- Google Auth ---------------- */
  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Signing in with Google...");
    try {
      const user = await authWithGoogle();
      const idToken = await user.getIdToken();
      const { data } = await axios.post(`${AUTH_API}/google-auth`, {
        access_token: idToken,
      });
      toast.dismiss(loadingToast);
      storeInSession("user", JSON.stringify(data));
      setUserAuth(data);
      toast.success(`Welcome ${data.first_name}!`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || "Google sign-in failed");
    }
  };

  /** ---------------- Send OTP (Signup) ---------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formElement.current) return toast.error("Form error.");

    const form = new FormData(formElement.current);
    const formData = Object.fromEntries(form.entries());

    if (!disclaimerAccepted)
      return toast.error("You must accept the disclaimer.");

    setLoading(true);
    try {
      await axios.post(`${AUTH_API}/signup`, {
        ...formData,
        latitude: geo.latitude,
        longitude: geo.longitude,
      });
      setOtpSent(true);
      toast.success("OTP sent to your email/mobile");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Verify OTP ---------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Enter OTP");
    setLoading(true);
    try {
      const { data } = await axios.post(`${AUTH_API}/verify-email-otp`, {
        email: formElement.current.email.value,
        otp,
      });
      if (data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully");
      } else toast.error("Invalid OTP");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Complete Signup ---------------- */
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = formElement.current.email.value;
      const { data } = await axios.post(`${AUTH_API}/complete-signup`, {
        email,
      });
      storeInSession("user", JSON.stringify(data));
      setUserAuth(data);
      if (data.customer_id) {
        setCustomerId(data.customer_id);
        setAbbr(data.abbr || "");
        toast.success(`Your Customer ID: ${data.customer_id}`);
      }
      toast.success(`Welcome ${data.first_name || data.fullname || "User"}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- JSX ---------------- */
  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center relative">
        <Toaster />
        {/* Loader overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
            <Loader />
          </div>
        )}
        <form
          ref={formElement}
          className="w-[80%] max-w-[400px]"
          style={loading ? { pointerEvents: "none", opacity: 0.5 } : {}}
        >
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome Back" : "Join us today"}
          </h1>

          {type !== "sign-in" && (
            <>
              <div className="flex gap-4 mb-4">
                <InputBox
                  name="first_name"
                  type="text"
                  placeholder="First name"
                  icon="fi-rr-user"
                  required
                />
                <InputBox
                  name="last_name"
                  type="text"
                  placeholder="Last name"
                  icon="fi-rr-user"
                  required
                />
              </div>
              <InputBox
                name="mobile_number"
                type="tel"
                placeholder="Mobile number"
                icon="fi-rr-mobile-notch"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
              {/* Removed Location Dropdowns */}
            </>
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
            required
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
            required
          />

          {/* OTP Field (show after sending OTP) */}
          {type !== "sign-in" && otpSent && !otpVerified && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">Enter OTP</label>
              <input
                className="input-box w-full"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <button
                className="btn-dark mt-2"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                Verify OTP
              </button>
            </div>
          )}

          {/* Disclaimer Checkbox */}
          {type !== "sign-in" && (
            <div className="mb-4 flex items-start gap-2">
              <input
                type="checkbox"
                id="disclaimer"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              />
              <label htmlFor="disclaimer" className="text-xs text-gray-600">
                By signing up, you agree to our <b>Terms of Service</b> and
                acknowledge that your location will be used for features like
                "Doctors Near Me". Your location data will be processed securely
                and only used for service improvement and safety. You can
                control your location sharing in your profile settings.
              </label>
            </div>
          )}

          {/* Signup/Send OTP Button */}
          {type !== "sign-in" && !otpSent && (
            <button
              className="btn-dark center mt-14"
              type="button"
              onClick={handleSendOtp}
              disabled={loading || !disclaimerAccepted}
            >
              Send OTP & Continue
            </button>
          )}

          {/* Signup Button (after OTP verified) */}
          {type !== "sign-in" && otpVerified && (
            <button
              className="btn-dark center mt-14"
              type="button"
              onClick={handleCompleteSignup}
              disabled={loading || !disclaimerAccepted}
            >
              Sign Up
            </button>
          )}

          {/* Sign In Button */}
          {type === "sign-in" && (
            <>
              <button
                className="btn-dark center mt-14"
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                Sign In
              </button>

              <p className="text-right mt-2 text-sm">
                <Link
                  to="/forgot-password"
                  className={`underline ${loading ? "pointer-events-none opacity-50" : ""}`}
                >
                  Forgot password?
                </Link>
              </p>
            </>
          )}

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
            type="button"
          >
            <img src={googleIcon} className="w-5" alt="Google" />
            continue with google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
        {/* Show customer ID and abbreviation after signup if available */}
        {customerId && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded text-green-800 text-center">
            <strong>Your Customer ID:</strong> {customerId}
            <br />
            {abbr && (
              <span>
                <strong>Abbreviation:</strong> {abbr}
              </span>
            )}
          </div>
        )}
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
