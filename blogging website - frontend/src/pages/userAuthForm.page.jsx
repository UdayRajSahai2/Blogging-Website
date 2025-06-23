import { useContext, useRef, useState } from "react";
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

const UserAuthForm = ({ type }) => {
  let { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
  const formElement = useRef();
  const [mobileNumber, setMobileNumber] = useState('');
  
  let serverRoute = type === "sign-in" ? "/signin" : "/signup";

  const userAuthThroughServer = (serverRoute, formData) => {
    let loadingToast = toast.loading("Authenticating...");
    
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        toast.dismiss(loadingToast);
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        toast.success(`Welcome ${data.first_name}!`);
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        toast.error(response?.data?.error || "Authentication failed");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{12,}$/;
    let mobileRegex = /^[+]?[0-9]{10,15}$/;

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
    }
    
    if (!email || !emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!password || !passwordRegex.test(password)) {
      return toast.error("Password must be at least 12 characters with uppercase, lowercase, number and special character");
    }
    
    userAuthThroughServer(serverRoute, formData);
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

  return (
    access_token ? 
    <Navigate to="/" />
    :
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form ref={formElement} className="w-[80%] max-w-[400px]">
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
          
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>
          
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
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;