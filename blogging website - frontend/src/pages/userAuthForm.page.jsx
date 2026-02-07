import { useContext, useRef, useState, useEffect } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import { authWithGoogle } from "../common/firebase";
import Loader from "../components/loader.component";


const UserAuthForm = ({ type }) => {
  let { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
  const formElement = useRef();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState({ latitude: null, longitude: null });
  const [customerId, setCustomerId] = useState("");
  const [abbr, setAbbr] = useState("");
  
  let serverRoute = type === "sign-in" ? "/signin" : "/signup";
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
  const passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

  const mobileRegex = /^[+]?[0-9]{10,15}$/;

  useEffect(() => {
    // Get location for both sign-in and sign-up
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeo({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (type !== "sign-in") {
            // Only show error toast for signup, not signin
            toast.error("Location permission denied or unavailable. Signup requires location access.");
          }
          // For sign-in, silently fail - location is optional but preferred
        }
      );
    } else {
      if (type !== "sign-in") {
        toast.error("Geolocation is not supported by this browser.");
      }
    }
  }, [type]);

  const userAuthThroughServer = (serverRoute, formData) => {
    let loadingToast = toast.loading("Authenticating...");
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        toast.dismiss(loadingToast);
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        if (data.customer_id) {
          setCustomerId(data.customer_id);
          setAbbr(data.abbr || "");
          toast.success(`Your Customer ID: ${data.customer_id}`);
        }
        toast.success(`Welcome ${data.first_name}!`);
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        const errorMsg = response?.data?.error || "Authentication failed";
        // Only for sign-in, check for location-required error
        if (
          type === "sign-in" &&
          errorMsg.toLowerCase().includes("location") &&
          errorMsg.toLowerCase().includes("customer")
        ) {
          toast("Sign-in requires your location to generate a customer ID.", { icon: "📍" });
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                toast.loading("Getting your location and retrying sign-in...");
                userAuthThroughServer(serverRoute, {
                  ...formData,
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                toast.error("Location permission denied. Sign-in requires location.");
              }
            );
          } else {
            toast.error("Geolocation is not supported by this browser.");
          }
        } else {
          toast.error(errorMsg);
        }
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure formElement.current is an HTMLFormElement
    if (!formElement.current || !(formElement.current instanceof HTMLFormElement)) {
      toast.error("Form reference error. Please reload the page and try again.");
      return;
    }
    let form = new FormData(formElement.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { first_name, last_name, email, password, mobile_number } = formData;

    if (type !== "sign-in") {
      if (!first_name || first_name.length < 1) {
        return toast.error("First name is required");
      }
      if (!last_name || last_name.length < 1) {
        return toast.error("Last name is required");
      }
      if (mobile_number && !mobileRegex.test(mobile_number)) {
        return toast.error("Mobile number is invalid");
      }
      if (geo.latitude === null || geo.longitude === null) {
        return toast.error("Location is required for signup. Please allow location access.");
      }
    }

    if (!email || !emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!password || !passwordRegex.test(password)) {
      return toast.error("Password must be at least 12 characters with uppercase, lowercase, number and special character");
    }

    // Always include location if available (for both sign-in and sign-up)
    const finalFormData = {
      ...formData,
      latitude: geo.latitude,
      longitude: geo.longitude
    };

    userAuthThroughServer(serverRoute, finalFormData);
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    let loadingToast = toast.loading("Signing in with Google...");
    
    try {
      const user = await authWithGoogle();
      const idToken = await user.getIdToken();
      
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/google-auth", 
        { access_token: idToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      toast.dismiss(loadingToast);
      storeInSession("user", JSON.stringify(response.data));
      setUserAuth(response.data);
      toast.success(`Welcome ${response.data.first_name}!`);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Google Auth Error:", error);
      toast.error(error.response?.data?.error || "Google sign-in failed");
    }
  };

  // Removed all location-related useEffect hooks

  // Removed location dropdown handlers

  // Removed validation for signup fields

  // Send OTP (simulate backend call)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    let form = new FormData(formElement.current);
    let formData = {};
    for (let [key, value] of form.entries()) formData[key] = value;

    if (!formData.first_name || formData.first_name.length < 1) {
      toast.error("First name is required");
      return;
    }
    if (!formData.last_name || formData.last_name.length < 1) {
      toast.error("Last name is required");
      return;
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.error("Email is invalid");
      return;
    }
    if (!formData.password || !passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 12 characters with uppercase, lowercase, number and special character");
      return;
    }
    if (formData.mobile_number && !mobileRegex.test(formData.mobile_number)) {
      toast.error("Mobile number is invalid");
      return;
    }
    if (!disclaimerAccepted) {
      toast.error("You must accept the disclaimer to continue");
      return;
    }

    setLoading(true);
    try {
      // Send signup request to backend, which should trigger OTP
      await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/signup", {
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

  // Verify OTP (call backend)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    setLoading(true);
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/verify-email-otp", {
        email: formElement.current.email.value,
        otp
      });
      if (data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Complete signup after OTP verified
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = formElement.current.email.value;
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/complete-signup", { email });
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

  return (
    access_token ? 
    <Navigate to="/" />
    :
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center relative">
        <Toaster />
        {/* Loader overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
            <Loader />
          </div>
        )}
        <form ref={formElement} className="w-[80%] max-w-[400px]" style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
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
                  className="flex-1"
                  required
                />
                <InputBox
                  name="last_name"
                  type="text"
                  placeholder="Last name"
                  icon="fi-rr-user"
                  className="flex-1"
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
              <input className="input-box w-full" type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
              <button className="btn-dark mt-2" onClick={handleVerifyOtp} disabled={loading}>Verify OTP</button>
            </div>
          )}
          
          {/* Disclaimer Checkbox */}
          {type !== "sign-in" && (
            <div className="mb-4 flex items-start gap-2">
              <input type="checkbox" id="disclaimer" checked={disclaimerAccepted} onChange={e => setDisclaimerAccepted(e.target.checked)} />
              <label htmlFor="disclaimer" className="text-xs text-gray-600">
                By signing up, you agree to our <b>Terms of Service</b> and acknowledge that your location will be used for features like "Doctors Near Me". Your location data will be processed securely and only used for service improvement and safety. You can control your location sharing in your profile settings.
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
            <button
              className="btn-dark center mt-14"
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              Sign In
            </button>
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
            <strong>Your Customer ID:</strong> {customerId}<br/>
            {abbr && <span><strong>Abbreviation:</strong> {abbr}</span>}
          </div>
        )}
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;