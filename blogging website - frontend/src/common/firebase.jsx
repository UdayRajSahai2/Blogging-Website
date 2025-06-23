// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

// Google Authentication Setup
const provider = new GoogleAuthProvider();
const auth = getAuth();

// Add these scopes to ensure we get the required information
provider.addScope('email');
provider.addScope('profile');

// Force account selection to avoid cached login issues
provider.setCustomParameters({
  prompt: 'select_account'
});

export const authWithGoogle = async () => {
  try {
    console.log("🚀 Starting Google authentication...");
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("✅ Google sign-in successful");
    console.log("User info:", {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid
    });

    // Verify we have required data
    if (!user.email || !user.displayName) {
      throw new Error("Missing required user information from Google");
    }

    // Get the ID token
    const idToken = await user.getIdToken();
    console.log("✅ ID token obtained:", idToken ? "Yes" : "No");
    
    if (!idToken) {
      throw new Error("Failed to obtain ID token");
    }

    // Return just the user object (not wrapped in an object)
    // This matches what your frontend expects
    return user;

  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Sign-in was cancelled by user");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup was blocked. Please allow popups and try again");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Multiple popup requests detected. Please wait and try again");
    } else if (error.code === 'auth/internal-error') {
      throw new Error("Internal authentication error. Please try again");
    }
    
    throw error;
  }
};