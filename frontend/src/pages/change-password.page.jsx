import { useContext, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { UserContext } from "../App";
import axios from "axios";
import { AUTH_API } from "../common/api";

const ChangePassword = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);
  const changePasswordForm = useRef();
  const [loading, setLoading] = useState(false);

  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!changePasswordForm.current) return;

    const form = new FormData(changePasswordForm.current);
    const formData = Object.fromEntries(form.entries());
    const { currentPassword, newPassword } = formData;

    // Validation
    if (!currentPassword || !newPassword) {
      return toast.error("❌ Both fields are required");
    }
    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "❌ Password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.",
      );
    }
    if (currentPassword === newPassword) {
      return toast.error(
        "❌ New password must be different from current password",
      );
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating password...");

    try {
      const response = await axios.post(
        `${AUTH_API}/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      toast.dismiss(loadingToast);
      toast.success(
        response.data.message || "✅ Password updated successfully!",
      );
      changePasswordForm.current.reset();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || "❌ An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm} className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Change Password</h1>

        <InputBox
          name="currentPassword"
          type="password"
          placeholder="Current Password"
          icon="fi-rr-unlock"
        />

        <InputBox
          name="newPassword"
          type="password"
          placeholder="New Password"
          icon="fi-rr-unlock"
        />

        <button
          onClick={handleSubmit}
          type="submit"
          className={`btn-dark w-full py-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
