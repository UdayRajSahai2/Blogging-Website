import InputBox from "../../input.component";
import { useState, useEffect } from "react";
import axios from "axios";
import { USER_API } from "../../../common/api";
import { EnvelopeIcon, AtSymbolIcon } from "@heroicons/react/24/outline";

const BasicInfoSection = ({ profile, setProfile, access_token, errors }) => {
  const { fullname, username, email, mobile_number } = profile;
  const { salutation } = profile.details || {};
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [newMobile, setNewMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("input"); // input | otp
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await axios.post(
        `${USER_API}/mobile/send-otp`,
        { mobile_number: newMobile },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      setMessage(`OTP sent to +91 ${newMobile}`);
      setTimer(30); // start countdown
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("Verifying...");

      await axios.post(
        `${USER_API}/mobile/verify-otp`,
        { otp },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      setMessage("✔ Mobile updated successfully");

      setProfile((prev) => ({
        ...prev,
        mobile_number: newMobile,
      }));

      // smooth close
      setTimeout(() => {
        setIsEditingMobile(false);
        setStep("input");
        setNewMobile("");
        setOtp("");
        setMessage("");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);
  return (
    <div className="bg-white border rounded-lg p-2 sm:p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {/* FULL NAME */}
        <div
          data-error={errors?.salutation ? "true" : undefined}
          className="flex flex-col"
        >
          <label className="text-xs font-medium text-gray-600 mb-1">
            Full Name
            <span className="ml-1 text-gray-400 text-[11px]">
              Choose a title (Mr, Ms, etc.)
            </span>
          </label>

          <div
            className={`flex items-center h-9 rounded-lg border overflow-hidden focus-within:ring-1 focus-within:ring-indigo-100 ${
              errors?.salutation
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 focus-within:border-indigo-500"
            }`}
          >
            <select
              name="salutation"
              value={salutation || ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  details: {
                    ...prev.details,
                    salutation: e.target.value,
                  },
                }))
              }
              className="h-full px-2 text-[13px] bg-transparent outline-none border-r border-gray-200 text-gray-600"
            >
              <option value="">Title</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>

            <input
              type="text"
              value={`${salutation ? salutation + ". " : ""}${fullname || ""}`}
              disabled
              className="flex-1 h-full px-2 text-[13px] bg-transparent outline-none text-gray-500"
            />
          </div>

          {/* INLINE ERROR */}
          {errors?.salutation && (
            <p className="text-xs text-red-500 mt-1">{errors.salutation}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Email
          </label>

          <InputBox
            name="email"
            value={email || ""}
            disabled
            icon={<EnvelopeIcon className="w-4 h-4" />}
            placeholder="Email"
          />
        </div>

        {/* USERNAME */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Username
          </label>

          <InputBox
            name="username"
            value={username || ""}
            icon={<AtSymbolIcon className="w-4 h-4" />}
            placeholder="Username"
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                username: e.target.value,
              }))
            }
          />
        </div>

        {/* MOBILE NUMBER */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Mobile Number
          </label>

          {!isEditingMobile ? (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* INPUT */}
              <div className="w-full sm:flex-1">
                <InputBox
                  name="mobile_number"
                  value={mobile_number || ""}
                  disabled
                  className="w-full" //  IMPORTANT (force full width)
                  prefix={
                    <div className="flex items-center gap-1">
                      <span>🇮🇳</span>
                      <span className="text-gray-600 text-xs font-medium">
                        +91
                      </span>
                    </div>
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setIsEditingMobile(true)}
                  className="h-9 px-3 text-xs rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition whitespace-nowrap"
                >
                  Change
                </button>

                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                  🔒 OTP required
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {/* STATUS */}
              {(message || error) && (
                <p
                  className={`text-[11px] ${
                    error ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {error || message}
                </p>
              )}

              {/* STEP 1: ENTER NUMBER */}
              {step === "input" && (
                <div className="flex  gap-2">
                  <div className="flex-1">
                    <InputBox
                      value={newMobile}
                      maxLength={10}
                      onChange={(e) =>
                        setNewMobile(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter 10-digit mobile"
                      prefix={
                        <div className="flex items-center gap-1">
                          <span>🇮🇳</span>
                          <span className="text-gray-600 text-xs font-medium">
                            +91
                          </span>
                        </div>
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={loading || newMobile.length !== 10}
                    className="h-9 px-3 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 whitespace-nowrap"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              )}

              {/* STEP 2: ENTER OTP */}
              {step === "otp" && (
                <div className="flex flex-col gap-2">
                  <div className="flex  gap-2">
                    <div className="flex-1">
                      <InputBox
                        value={otp}
                        maxLength={6}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="h-9 px-3 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-40 whitespace-nowrap"
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </button>
                  </div>

                  {/* RESEND */}
                  <div className="text-[11px] text-gray-500 flex justify-between">
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading || timer > 0}
                      className="text-indigo-600 disabled:text-gray-400 hover:underline"
                    >
                      {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                    </button>

                    <span className="text-gray-400">
                      Sent to +91 {newMobile}
                    </span>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <div className="flex justify-between items-center text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingMobile(false);
                    setStep("input");
                    setMessage("");
                    setError("");
                    setOtp("");
                    setNewMobile("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
