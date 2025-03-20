// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsOFT-JkTn_1jFikRdGYEt6Vd9TwMOI7Y",
  authDomain: "reactjs-blogging-website-ac6e9.firebaseapp.com",
  projectId: "reactjs-blogging-website-ac6e9",
  storageBucket: "reactjs-blogging-website-ac6e9.firebasestorage.app",
  messagingSenderId: "751617263929",
  appId: "1:751617263929:web:1631bed26fed09472640e8",
  measurementId: "G-CZ3L8LQEL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//google Authentication 

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Get the ID token (access token)
      const idToken = await user.getIdToken();
  
      // Return the user data along with the access token
      return {
        access_token: idToken, // This is the token required for server-side verification
        user: {
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
        },
      };
    } catch (err) {
      console.error("Google Auth Error:", err);
      throw err; // Propagate the error so it can be handled by the caller
    }
  };