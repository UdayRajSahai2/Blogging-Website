import { useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";

const UserAuthForm = ({ type }) => {
  let serverRoute = type === "sign-in" ? "/signin" : "/signup";
  console.log("API URL:", import.meta.env.VITE_SERVER_DOMAIN + serverRoute);

  const userAuthThroughServer = (serverRoute,formData) => {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute,formData).then(({data}) => {
        console.log(data);
      })
      .catch(({response}) => {
        toast.error(response.data.error)
      })
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{12,}$/;

    let form = new FormData(formElement);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    console.log(formData);

    let { fullname, email, password } = formData;
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Fullname must be at least 3 letters long");
      }
    }
    if (!email.length) {
      return toast.error("Enter email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!passwordRegex.test(password)) {
      return toast.error("Password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.");
    }
    userAuthThroughServer(serverRoute,formData)
  };
  return (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">   
            {type === "sign-in" ? "Welcome Back" : "Join us today"}
          </h1>
          {type !== "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
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
          <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
            <img src={googleIcon} className="w-5" />
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
