import toast, { Toaster } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { useContext, useRef } from "react";
import { UserContext } from "../App";
import axios from "axios"; // Make sure axios is imported

const ChangePassword = () => {
    let { userAuth: { access_token } } = useContext(UserContext);
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    let changePasswordForm = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let form = new FormData(changePasswordForm.current);
        let formData = {};
        
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        
        console.log("Form data:", formData); // Debug log
        
        // Fixed: Match the exact field names from your form
        let { currentPassword, newPassword } = formData;
        
        // Check if fields exist and have length
        if (!currentPassword || !currentPassword.length || !newPassword || !newPassword.length) {
            return toast.error("Fill all the inputs");
        }
        
        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error("❌ Password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.");
        }
        
        if (currentPassword === newPassword) {
            return toast.error("❌ New password must be different from current password");
        }
        
        e.target.setAttribute("disabled", true);
        let loadingToast = toast.loading("Updating......");
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            // Clear the form
            changePasswordForm.current.reset();
            return toast.success("Password Updated Successfully!");
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(response?.data?.error || "An error occurred");
        });
    };

    return (
        <AnimationWrapper>
            <Toaster />
            <form ref={changePasswordForm}>
                <h1 className="max-md:hidden">Change password</h1>
                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox
                        name="currentPassword"  // Fixed: Remove hyphen, match server expectation
                        type="password"
                        className="profile-edit-input"
                        placeholder="Current Password"
                        icon="fi-rr-unlock"
                    />
                    <InputBox
                        name="newPassword"  // Fixed: Remove hyphen, match server expectation
                        type="password"
                        className="profile-edit-input"
                        placeholder="New Password"
                        icon="fi-rr-unlock"
                    />
                    <button 
                        onClick={handleSubmit} 
                        className="btn-dark px-10" 
                        type="submit"
                    >
                        Change Password
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default ChangePassword;