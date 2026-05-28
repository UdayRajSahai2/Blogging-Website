import { useRef, useState } from "react";

import toast from "react-hot-toast";

import { LockClosedIcon } from "@heroicons/react/24/outline";

import AnimationWrapper from "../common/page-animation";

import InputBox from "../components/input.component";

import { changePassword } from "../api/auth.api";

const ChangePassword = () => {
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

    // VALIDATION
    if (!currentPassword || !newPassword) {
      return toast.error("Please fill all fields");
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password must be at least 12 characters with uppercase, lowercase, number and special character",
      );
    }

    if (currentPassword === newPassword) {
      return toast.error("New password must be different");
    }

    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success(response.data.message || "Password updated successfully");

      changePasswordForm.current.reset();
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimationWrapper>
      <div className="flex justify-center px-2 py-2">
        <form
          ref={changePasswordForm}
          onSubmit={handleSubmit}
          className="
            w-full
            max-w-md
            rounded-xl
            border
            border-gray-200
            bg-white
            p-4
            shadow-sm
          "
        >
          {/* HEADER */}
          <div className="mb-6 text-center">
            <div
              className="
                mx-auto mb-3
                flex h-12 w-12 items-center justify-center
                rounded-full
                bg-gray-100
              "
            >
              <LockClosedIcon className="h-6 w-6 text-gray-700" />
            </div>

            <h1 className="text-2xl font-bold">Change Password</h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your account password
            </p>
          </div>

          {/* INPUTS */}
          <div className="space-y-4">
            <InputBox
              name="currentPassword"
              type="password"
              placeholder="Current Password"
              icon={<LockClosedIcon className="h-4 w-4" />}
            />

            <InputBox
              name="newPassword"
              type="password"
              placeholder="New Password"
              icon={<LockClosedIcon className="h-4 w-4" />}
            />
          </div>

          {/* INFO */}
          <p className="mt-4 text-xs text-gray-500 leading-5 text-justify">
            Password must contain uppercase, lowercase, number, special
            character and minimum 12 characters.
          </p>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`
              mt-6
              w-full
              rounded-lg
              bg-black
              py-3
              text-sm
              font-medium
              text-white
              transition

              ${loading ? "cursor-not-allowed opacity-60" : "hover:bg-gray-800"}
            `}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </AnimationWrapper>
  );
};

export default ChangePassword;
