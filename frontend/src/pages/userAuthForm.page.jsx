import { useContext, useRef, useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import Loader from "../components/loader.component";
import {
  signIn,
  signUp,
  googleAuth,
  verifyEmailOtp,
  completeSignup,
} from "../api/auth.api";
import { emailRegex, passwordRegex, mobileRegex } from "../utils/validators";
import AuthLeftActions from "../components/auth/AuthLeftActions";
import AuthRightActions from "../components/auth/AuthRightActions";
import AuthBottomActions from "../components/auth/AuthBottomActions";
import { UserIcon, EnvelopeIcon, KeyIcon } from "@heroicons/react/24/outline";
import { AcademicCapIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import ReactCountryFlag from "react-country-flag";
import EnrollmentFields from "../components/EnrollmentFields";

const UserAuthForm = ({ type }) => {
  const navigate = useNavigate();
  const { userAuth, setUserAuth } = useContext(UserContext);

  const access_token = userAuth?.access_token;
  const formElement = useRef();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [signupType, setSignupType] = useState("normal");
  const [isStudent, setIsStudent] = useState(false);
  const [referrerMobile, setReferrerMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState({ latitude: null, longitude: null });
  const [customerId, setCustomerId] = useState("");
  const [abbr, setAbbr] = useState("");
  const [step, setStep] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const serverRoute = type === "sign-in" ? "/signin" : "/signup";

  const emailChecks = {
    valid: emailRegex.test(email),
  };
  const mobileChecks = {
    valid: mobileRegex.test(mobileNumber),
  };
  const passwordChecks = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const showWelcomeMessage = (data) => {
    const name = data.first_name || data.fullname || "User";
    const isNewUser = Boolean(data.isNewUser);
    if (data.isNewUser && data.customer_id) {
      setCustomerId(data.customer_id);
      setAbbr(data.abbr || "");
      toast.success(`Welcome ${name}! Customer ID: ${data.customer_id}`);
    } else {
      toast.success(`Welcome back ${name}!`);
    }
  };
  const saveUserSession = (data) => {
    storeInSession("user", data);
    storeInSession("onboarding", type === "sign-up");
    setUserAuth(data);
  };
  const redirectUser = () => {
    navigate(type === "sign-up" ? "/welcome" : "/");
  };
  useEffect(() => {
    // reset form fields
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setMobileNumber("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setDisclaimerAccepted(false);

    // UI state
    setIsFocused(false);
  }, [type]);

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
          toast.error("Location permission is required to create an account."),
      );
    } else if (type !== "sign-in") {
      toast.error("Geolocation not supported by your browser.");
    }
    setStep(1);
  }, [type]);

  /** ---------------- Signin / Signup ---------------- */
  const userAuthThroughServer = async (serverRoute, formData) => {
    if (loading) return; //  prevent double submit

    const loadingToast = toast.loading("Please wait...");
    setLoading(true);

    try {
      const authFn = type === "sign-in" ? signIn : signUp;

      const { data } = await authFn(formData);

      toast.dismiss(loadingToast);

      if (type === "sign-in") {
        saveUserSession(data);
        showWelcomeMessage(data);
        redirectUser();
      } else {
        toast.success(data.message);
        navigate("/approval-pending");
      }
    } catch (err) {
      toast.dismiss(loadingToast);

      const errorCode = err.response?.data?.code;

      const errorMsg =
        err.response?.data?.error ||
        (err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Authentication failed");

      //  Smart location retry (ONLY once)
      const needsLocation =
        typeof errorMsg === "string" &&
        errorMsg.toLowerCase().includes("location") &&
        errorMsg.toLowerCase().includes("customer");

      const alreadyTriedGeo = formData?.latitude && formData?.longitude;

      if (type === "sign-in" && needsLocation && !alreadyTriedGeo) {
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
                type,
                signup_type: signupType,
              }),
            () =>
              toast.error(
                "Location permission denied. Sign-in requires location.",
              ),
            { enableHighAccuracy: false, timeout: 10000 },
          );
        } else {
          toast.error("Geolocation not supported by your browser.");
        }
      } else {
        if (errorCode === "ACCOUNT_PENDING") {
          navigate("/approval-pending");
          return;
        }

        if (errorCode === "ACCOUNT_REJECTED") {
          toast.error(errorMsg);
          return;
        }

        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Handle Form Submit ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    if (
      !formElement.current ||
      !(formElement.current instanceof HTMLFormElement)
    ) {
      return toast.error("Form error. Please refresh.");
    }

    //  collect + trim form data
    const form = new FormData(formElement.current);
    const rawData = Object.fromEntries(form.entries());

    const formData = Object.fromEntries(
      Object.entries(rawData).map(([k, v]) => [k, v?.toString().trim()]),
    );

    const { first_name, last_name, email, password, mobile_number } = formData;

    // signup validations
    if (type !== "sign-in") {
      if (!first_name) return toast.error("First name required");
      if (!last_name) return toast.error("Last name required");

      if (!mobile_number) {
        return toast.error("Mobile number required");
      }

      if (!mobileRegex.test(mobile_number)) {
        return toast.error("Mobile number invalid");
      }
      //  email validation (always first)
      if (!email || !emailRegex.test(email)) {
        return toast.error("Valid email required");
      }

      if (!password) return toast.error("Password required");

      if (!passwordRegex.test(password)) {
        return toast.error(
          "Password must have 12+ chars, uppercase, lowercase, number & symbol",
        );
      }

      if (!geo.latitude || !geo.longitude) {
        return toast.error("Location required for signup");
      }

      // Enrollment validations
      const {
        referrer_name,
        referrer_email,
        referrer_mobile,
        referrer_district,
      } = formData;

      if (!referrer_name) {
        return toast.error("Referrer name is required");
      }

      if (!referrer_email || !emailRegex.test(referrer_email)) {
        return toast.error("Please enter a valid referrer email");
      }

      if (!referrer_mobile || !mobileRegex.test(referrer_mobile)) {
        return toast.error("Please enter a valid referrer mobile number");
      }

      if (!referrer_district) {
        return toast.error("Referrer district is required");
      }
    } else {
      // sign-in validations
      if (!password) return toast.error("Password required");
    }
    // call server
    userAuthThroughServer(serverRoute, {
      ...formData,
      signup_type: signupType,
      latitude: geo.latitude,
      longitude: geo.longitude,
      type,
    });
  };

  /** ---------------- Google Auth ---------------- */
  const handleGoogleAuth = async (e) => {
    e.preventDefault();

    if (loading) return;

    const loadingToast = toast.loading("Signing in with Google...");
    setLoading(true);

    try {
      const user = await authWithGoogle();

      if (!user) {
        toast.dismiss(loadingToast);
        setLoading(false);
        return toast.error("Google authentication cancelled");
      }

      const idToken = await user.getIdToken(true);

      // ensure we have location
      let latitude = geo.latitude;
      let longitude = geo.longitude;

      if (!latitude || !longitude) {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
            });
          });

          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

          setGeo({
            latitude,
            longitude,
          });
        }
      }

      const { data } = await googleAuth({
        access_token: idToken,
        latitude,
        longitude,
      });

      toast.dismiss(loadingToast);

      saveUserSession(data);
      showWelcomeMessage(data);
      redirectUser();
    } catch (err) {
      toast.dismiss(loadingToast);

      const firebaseCode = err.code || "";
      const errorCode = err.response?.data?.code;
      const backendMsg = err.response?.data?.error;

      if (firebaseCode === "auth/popup-closed-by-user") {
        toast("Google sign-in cancelled");
      } else if (firebaseCode === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection.");
      } else {
        if (errorCode === "ACCOUNT_PENDING") {
          navigate("/approval-pending");
          return;
        }

        if (errorCode === "ACCOUNT_REJECTED") {
          toast.error(backendMsg);
          return;
        }

        toast.error(backendMsg || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Send OTP (Signup) ---------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formElement.current) {
      return toast.error("Form error. Please refresh.");
    }

    if (otpSent) {
      return toast("OTP already sent. Please check your email.");
    }

    if (!disclaimerAccepted) {
      return toast.error("You must accept the disclaimer.");
    }

    const form = new FormData(formElement.current);
    const rawData = Object.fromEntries(form.entries());

    //  trim all fields
    const formData = Object.fromEntries(
      Object.entries(rawData).map(([k, v]) => [k, v?.toString().trim()]),
    );

    //  validations (important before hitting server)
    const {
      first_name,
      last_name,
      email,
      password,
      mobile_number,
      referrer_name,
      referrer_email,
      referrer_mobile,
      referrer_district,
    } = formData;

    // Personal details
    if (!first_name) return toast.error("First name required");

    if (!last_name) return toast.error("Last name required");

    if (!mobile_number) {
      return toast.error("Mobile number required");
    }

    if (!mobileRegex.test(mobile_number)) {
      return toast.error("Mobile number invalid");
    }

    if (!email || !emailRegex.test(email)) {
      return toast.error("Valid email required");
    }

    if (!password) {
      return toast.error("Password required");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must have 12+ chars, uppercase, lowercase, number & symbol",
      );
    }
    // Location
    if (!geo.latitude || !geo.longitude) {
      toast.loading("Getting your location...");

      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }),
        );

        setGeo({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        // continue signup using these coordinates
      } catch (err) {
        toast.dismiss();

        return toast.error(
          "We couldn't access your location. Please allow location permission and try again.",
        );
      }

      toast.dismiss();
    }

    // Referrer details
    if (!referrer_name) {
      return toast.error("Referrer name is required");
    }

    if (!referrer_email || !emailRegex.test(referrer_email)) {
      return toast.error("Please enter a valid referrer email");
    }

    if (!referrer_mobile) {
      return toast.error("Referrer mobile number is required");
    }

    if (!mobileRegex.test(referrer_mobile)) {
      return toast.error("Please enter a valid referrer mobile number");
    }

    if (!referrer_district) {
      return toast.error("Referrer district is required");
    }

    setLoading(true);

    try {
      await signUp({
        ...formData,
        isStudent,
        latitude: geo.latitude,
        longitude: geo.longitude,
      });

      setOtpSent(true);
      setStep(2);
      toast.success("OTP sent to your email/mobile");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send OTP";

      //  backend message handling
      if (msg === "Email already exists") {
        toast.error("Email already registered. Please sign in.");
      } else if (msg === "Mobile number already exists") {
        toast.error("This mobile number is already registered.");
      } else if (msg.toLowerCase().includes("rate")) {
        toast.error("Too many requests. Please wait and try again.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Verify OTP ---------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (loading) return;

    const otpValue = otp?.toString().trim();

    if (!otpValue) {
      return toast.error("Enter OTP");
    }

    // basic OTP format check (6 digits — adjust if needed)
    if (!/^\d{4,8}$/.test(otpValue)) {
      return toast.error("Invalid OTP format");
    }

    if (!formElement.current) {
      return toast.error("Form error. Please refresh.");
    }

    const email = formElement.current.email?.value;

    if (!email) {
      return toast.error("Email missing");
    }

    if (otpVerified) {
      return toast("OTP already verified");
    }

    setLoading(true);

    try {
      const { data } = await verifyEmailOtp({
        email,
        otp: otpValue,
      });

      if (data?.success) {
        setOtpVerified(true);
        setStep(3);
        toast.success("OTP verified successfully");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to verify OTP";

      //  handling for expired OTP
      if (msg.toLowerCase().includes("expired")) {
        toast.error("OTP expired. Please resend OTP.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Complete Signup ---------------- */
  const handleCompleteSignup = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      return toast.error("Please verify OTP first");
    }

    setLoading(true);

    try {
      const email = formElement.current.email.value;

      const { data } = await completeSignup({
        email,
      });

      toast.success(data.message);
      navigate("/approval-pending");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- JSX ---------------- */
  return access_token ? (
    <Navigate to={userAuth?.isOnboardingCompleted ? "/" : "/welcome"} />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="w-full px-0 md:px-0 py-0 relative">
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90">
            <Loader />

            <p className="mt-2 text-sm text-gray-600">Please wait...</p>
          </div>
        )}

        <div className=" max-w-7xl ">
          {/* TOP GRID */}
          {/* LEFT = 220px 
          FORM = flexible (remaining space) 1fr
          RIGHT = 220px */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-y-2 md:gap-6 items-start w-full overflow-hidden">
            {/* LEFT */}
            <div className="w-full px-0">
              <AuthLeftActions />
            </div>

            {/* CENTER FORM */}
            <div className="w-full">
              <form
                ref={formElement}
                className="w-full bg-white px-0 sm:px-6 pt-0 sm:pt-1 pb-0 sm:pb-0 rounded-lg"
                style={loading ? { pointerEvents: "none", opacity: 0.6 } : {}}
              >
                <h1 className="text-2xl sm:text-3xl font-gelasio capitalize text-center mb-0">
                  {type === "sign-in" ? "Welcome" : "Join us today"}
                </h1>
                <div
                  className="mt-0 mb-0.5 text-center space-y-1"
                  role="region"
                  aria-live="polite"
                  aria-labelledby="auth-heading"
                >
                  {type === "sign-in" ? (
                    <>
                      <h4
                        id="auth-heading"
                        className="text-base font-semibold text-gray-800"
                      >
                        Welcome — your presence here truly matters.
                      </h4>

                      <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                        Pick up where you left off and continue building{" "}
                        <span className="font-medium text-gray-800">
                          something meaningful
                        </span>
                        . Stay connected with{" "}
                        <span className="font-medium text-indigo-600">
                          people
                        </span>
                        , share your{" "}
                        <span className="font-medium text-indigo-600">
                          thoughts
                        </span>
                        , and grow your{" "}
                        <span className="font-medium text-gray-800">
                          network
                        </span>{" "}
                        through{" "}
                        <span className="font-medium text-gray-800">
                          real conversations
                        </span>{" "}
                        and{" "}
                        <span className="font-medium text-green-600">
                          meaningful interactions
                        </span>
                        .
                      </p>
                    </>
                  ) : (
                    <>
                      <h4
                        id="auth-heading"
                        className="text-base font-semibold underline text-gray-800"
                      >
                        Create more than an account — build your identity.
                      </h4>

                      <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                        Start your journey by creating a profile that represents
                        you truly.
                      </p>
                    </>
                  )}
                </div>
                {/* SIGNUP FIELDS */}
                {type !== "sign-in" && step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <InputBox
                        name="first_name"
                        disabled={otpSent}
                        type="text"
                        placeholder="First name"
                        icon={<UserIcon className="w-4 h-4" />}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />

                      <InputBox
                        name="last_name"
                        disabled={otpSent}
                        type="text"
                        placeholder="Last name"
                        icon={<UserIcon className="w-4 h-4" />}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <InputBox
                      name="mobile_number"
                      disabled={otpSent}
                      type="tel"
                      placeholder="Enter mobile number"
                      value={mobileNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setMobileNumber(value);
                      }}
                      maxLength={10}
                      inputMode="numeric"
                      prefix={
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <ReactCountryFlag
                            countryCode="IN"
                            svg
                            style={{
                              width: "18px",
                              height: "12px",
                            }}
                          />

                          <span className="font-medium">+91</span>
                        </div>
                      }
                    />
                    {mobileNumber.length > 0 && !mobileChecks.valid && (
                      <p className="text-xs text-red-500 mt-0">
                        Enter a valid 10-digit mobile number
                      </p>
                    )}
                  </>
                )}
                <InputBox
                  name="email"
                  disabled={otpSent}
                  type="email"
                  placeholder="Email"
                  icon={<EnvelopeIcon className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                />
                {type !== "sign-in" && (isEmailFocused || email.length > 0) && (
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      email.length === 0
                        ? "text-gray-400"
                        : emailChecks.valid
                          ? "text-green-500"
                          : "text-red-500"
                    }`}
                  >
                    {(isEmailFocused || email.length > 0) &&
                      email.length > 0 &&
                      !emailChecks.valid && (
                        <p className="text-xs  text-red-500">
                          Enter a valid email (e.g. example@gmail.com)
                        </p>
                      )}
                  </p>
                )}
                <InputBox
                  name="password"
                  disabled={otpSent}
                  type="password"
                  placeholder="Password"
                  icon={<KeyIcon className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                />{" "}
                {type !== "sign-in" && (
                  <p className="text-[12px] text-gray-500 whitespace-nowrap">
                    Password: Min. 12 characters, alphanumeric (1 uppercase, 1
                    symbol, 1 number)
                  </p>
                )}
                {type !== "sign-in" && (
                  <div className="mb-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-gray-700">
                        Select Type:
                      </span>

                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="userType"
                          checked={isStudent}
                          onChange={() => setIsStudent(true)}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <AcademicCapIcon className="h-4 w-4 text-indigo-600" />
                        <span>Enroll as Student</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="userType"
                          checked={!isStudent}
                          onChange={() => setIsStudent(false)}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <UserIcon className="h-4 w-4 text-gray-600" />
                        <span>Others</span>
                      </label>
                    </div>
                  </div>
                )}
                {/* ENROLLMENT */}
                {type === "sign-up" && (
                  <EnrollmentFields
                    referrerMobile={referrerMobile}
                    setReferrerMobile={setReferrerMobile}
                    disabled={otpSent}
                  />
                )}
                {/* OTP FIELD */}
                {type !== "sign-in" && step === 2 && (
                  <div className="mt-0.5">
                    <label className="block mb-2 text-sm font-medium text-center">
                      Enter OTP
                    </label>
                    <div className="flex justify-between gap-2">
                      {[...Array(6)].map((_, i) => (
                        <input
                          key={i}
                          type="tel"
                          inputMode="numeric"
                          maxLength={1}
                          className={`w-12 h-12 text-center border rounded-lg text-lg outline-none transition
                            ${
                              !otpSent
                                ? "bg-gray-50 text-gray-700 border-gray-300 cursor-not-allowed"
                                : "bg-white text-black border-gray-500 focus:ring-2 focus:ring-black"
                            }
                                          `}
                          value={otp[i] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!/^[0-9]?$/.test(value)) return;

                            const newOtp = otp.split("");
                            newOtp[i] = value;
                            setOtp(newOtp.join(""));

                            if (value && e.target.nextSibling) {
                              e.target.nextSibling.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Backspace" &&
                              !otp[i] &&
                              e.target.previousSibling
                            ) {
                              e.target.previousSibling.focus();
                            }
                          }}
                        />
                      ))}
                    </div>

                    <button
                      className="btn-dark w-full mt-4"
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length !== 6}
                    >
                      Verify OTP
                    </button>
                  </div>
                )}{" "}
                {type !== "sign-in" && step === 3 && (
                  <div className="mt-0 rounded-md border border-green-200 bg-green-50 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-emerald-800">
                          OTP verified successfully. Click{" "}
                          <strong>Confirm Sign-up</strong>.
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteSignup}
                      disabled={loading}
                      className="mt-4 w-full rounded-full bg-emerald-600 px-6 py-3 text-xl  text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {loading ? "Confirming..." : "Confirm Sign-up"}
                    </button>
                  </div>
                )}
                {/* DISCLAIMER */}
                {type !== "sign-in" && step === 1 && (
                  <div className="mt-0 flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                    <input
                      type="checkbox"
                      disabled={otpSent}
                      id="disclaimer"
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 cursor-pointer accent-indigo-600"
                    />

                    <label htmlFor="disclaimer" className="cursor-pointer">
                      By signing up, you agree to our{" "}
                      <span className="font-medium underline cursor-pointer">
                        Terms and Conditions.
                      </span>
                    </label>
                  </div>
                )}
                {/* ACTION BUTTON */}
                {type === "sign-in" ? (
                  <button
                    className="btn-dark w-full mt-0"
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Login
                  </button>
                ) : step === 1 ? (
                  <button
                    className={`btn-dark w-full mt-1 ${
                      !disclaimerAccepted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !disclaimerAccepted}
                  >
                    Send OTP & Continue
                  </button>
                ) : null}
                {/* LINKS */}
                <div className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-600 flex-wrap">
                  {type !== "sign-in" && (
                    <>
                      <span>Already have an account?</span>
                      <Link to="/signin" className="underline text-black">
                        Sign in
                      </Link>
                      <span className="text-gray-400">|</span>
                    </>
                  )}

                  {type === "sign-in" && (
                    <>
                      <Link to="/signup" className="underline text-black">
                        New here? Create an account
                      </Link>
                      <span className="text-gray-400">|</span>
                      <Link
                        to="/forgot-password"
                        className={`text-black underline ${
                          loading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        Forgot password
                      </Link>
                      <span className="text-gray-400">|</span>
                    </>
                  )}

                  <Link to="/" className="text-black underline">
                    Go to Homepage
                  </Link>
                </div>
                {/* OR */}
                {type === "sign-in" && (
                  <>
                    <div className="flex items-center gap-3 my-0 text-xs uppercase text-gray-400 font-semibold">
                      <hr className="flex-1 border-gray-300" />
                      <p>or</p>
                      <hr className="flex-1 border-gray-300" />
                    </div>

                    <button
                      className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-3 hover:bg-gray-50"
                      onClick={handleGoogleAuth}
                      type="button"
                    >
                      <img src={googleIcon} className="w-5" alt="Google" />
                      Continue with Google
                    </button>

                    <p className="mt-2 text-center text-xs text-gray-500">
                      Google Sign-In is available only for registered accounts.
                    </p>
                  </>
                )}
              </form>
            </div>

            {/* RIGHT */}
            <div className="w-full px-0">
              <AuthRightActions />
            </div>
          </div>
          {/* BOTTOM */}
          <div className="mt-auto ">
            <AuthBottomActions type={type} />
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
