import React, { useEffect, useState, useCallback } from "react";
import apiClient from "../../services/apiClient";
import { PROFESSIONAL_PROFILE_API } from "../../common/api";

import ExperienceSection from "../../components/profile/experience/ExperienceSection";

export default function ProfessionalProfilePage({ onNext, isOnboarding }) {
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [skipExperience, setSkipExperience] = useState(false);
  const showExperienceForm = !skipExperience;
  /* ---------------- SANITIZE ---------------- */
  const sanitize = useCallback((obj) => {
    const clean = {};
    Object.keys(obj).forEach((key) => {
      clean[key] = obj[key] === "" ? null : obj[key];
    });
    return clean;
  }, []);

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(PROFESSIONAL_PROFILE_API);
      const data = res.data.data || {};

      setProfession(data.profession || null);
      setExperiences(data.experiences || []);
    } catch (err) {
      console.error("Profile fetch error:", err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  useEffect(() => {
    if (experiences.length > 0 && skipExperience) {
      setSkipExperience(false);
    }
  }, [experiences]);
  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <p>Loading professional profile...</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* CONTAINER */}
      <div className="w-full min-w-0 px-1 sm:px-1 sm:py-1">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-xl font-semibold text-gray-800">
            Professional Profile
          </h1>
        </div>

        {/* EXPERIENCE CARD */}
        <section className=" border border-gray-100 rounded-md p-3 sm:p-4 shadow-sm">
          {showExperienceForm && (
            <ExperienceSection
              experiences={experiences}
              setExperiences={setExperiences}
              api={PROFESSIONAL_PROFILE_API}
              sanitize={sanitize}
            />
          )}

          {!skipExperience && experiences.length === 0 && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              No experience added yet
            </p>
          )}
          {isOnboarding && experiences.length === 0 && (
            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 font-medium">
                You can add your professional details now or skip for later
              </p>

              <label className="flex items-center justify-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipExperience}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSkipExperience(checked);

                    if (checked) {
                      setExperiences([]); // optional but prevents conflict
                    }
                  }}
                  className="accent-blue-600"
                />

                <span className="text-gray-600 hover:text-gray-800 transition">
                  I’ll add my professional details later
                </span>
              </label>
            </div>
          )}
          {isOnboarding && (
            <div className="mt-8 flex flex-col items-center gap-4">
              {/* Trust / Disclaimer Card */}
              <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 max-w-full">
                <div className="text-blue-600 text-lg mt-0.5">🔒</div>

                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    Your data stays in your control
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    By continuing, you confirm your information is accurate and
                    agree to its use for building your profile. You can edit or
                    remove it anytime.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                disabled={!experiences.length && !skipExperience}
                onClick={() => {
                  if (!experiences.length && !skipExperience) return;
                  if (onNext) onNext();
                }}
                className={`px-8 py-2.5 rounded-lg text-white font-medium transition ${
                  !experiences.length && !skipExperience
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-sm"
                }`}
              >
                Complete Profile
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
