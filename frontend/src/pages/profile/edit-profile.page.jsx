import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../../common/page-animation";
import { getUserTypeFromOccupation } from "../../common/userType.utils";
import { Toaster, toast } from "react-hot-toast";

import { storeInSession } from "../../common/session";
import {
  UPLOAD_API,
  USER_API,
  USER_DETAILS_API,
  INTEREST_API,
  LOCATION_API,
} from "../../common/api";

import ProfileImageSection from "../../components/profile/edit-profile/ProfileImageSection";
import BasicInfoSection from "../../components/profile/edit-profile/BasicInfoSection";
import BioSection from "../../components/profile/edit-profile/BioSection";
import InterestsSection from "../../components/profile/edit-profile/InterestsSection";
import PersonalDetailsSection from "../../components/profile/edit-profile/PersonalDetails";
import AddressSection from "../../components/profile/edit-profile/AddressSection";
import SocialLinksSection from "../../components/profile/edit-profile/SocialLinks";

const EditProfile = ({ onNext, isOnboarding }) => {
  const bioLimit = 3000;
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
  const uploadButtonRef = useRef(null);
  const [isPublic, setIsPublic] = useState(false);
  // Profession selection state
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [interests, setInterests] = useState([]);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState({});
  const [districts, setDistricts] = useState({});

  const isFormValid =
    Boolean(profile.bio?.trim()) &&
    interests.length > 0 &&
    Array.isArray(profile.addresses) &&
    profile.addresses.some(
      (addr) =>
        addr.state_code ||
        addr.country_code ||
        addr.city?.trim() ||
        addr.street?.trim(),
    );
  const {
    fullname,
    username,
    profile_img,
    email,
    bio,
    addresses = [],
  } = profile;
  const getAddress = (type) => addresses?.find((a) => a.type === type) || {};
  const { salutation } = profile.details || {};

  const { facebook, instagram, twitter, youtube, github, website, whatsapp } =
    profile.details || {};
  const [skipAutoSave, setSkipAutoSave] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.post(`${USER_API}/get-profile`, {
        username: userAuth.username,
      });

      const mergedProfile = {
        ...data,
        addresses: (data.addresses || []).map((addr) => ({
          type: addr.type,

          city: addr.city || "",
          street: addr.street || "",
          zip_code: addr.zip_code || "",

          country_code: addr.country_code || "",
          state_code: addr.state_code || "",
          district_code: addr.district_code || "",

          // display values
          country: addr.countryDetails?.country_name || "",
          state: addr.stateDetails?.state_name || "",
          district: addr.districtDetails?.district_name || "",
        })),
        details: data.details || {},
      };

      setProfile(mergedProfile);

      setCharactersLeft(
        bioLimit - (mergedProfile.bio ? mergedProfile.bio.length : 0),
      );

      setSelectedDomain(data.domain_id || "");
      setSelectedField(data.field_id || "");
      setSelectedSpecialty(data.specialty_id || "");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInterests = async () => {
    try {
      const res = await axios.get(`${INTEREST_API}/user`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const interestsData = res.data?.data || [];

      setInterests(interestsData);
    } catch (err) {
      console.error(err);
      setInterests([]);
    }
  };
  useEffect(() => {
    if (!access_token) return;

    Promise.all([fetchProfile(), fetchInterests()]).finally(() =>
      setLoading(false),
    );
  }, [access_token, userAuth.username]);

  const fetchSuggestions = async () => {
    const res = await axios.get(`${INTEREST_API}/tree`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    return res.data?.data || [];
  };
  const handleCharacterChange = (e) => {
    setProfile({ ...profile, bio: e.target.value });
    setCharactersLeft(bioLimit - e.target.value.length);

    if (errors.bio) {
      setErrors((prev) => ({ ...prev, bio: null }));
    }
  };
  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${LOCATION_API}/countries`);
      setCountries(res.data || []);
    } catch (err) {
      console.error("Error fetching countries", err);
      setCountries([]);
    }
  };

  const fetchStates = async (countryCode, type) => {
    try {
      const res = await axios.get(
        `${LOCATION_API}/states?country_code=${countryCode}`,
      ); // states

      setStates((prev) => ({
        ...prev,
        [type]: res.data || [],
      }));
    } catch (err) {
      console.error("Error fetching states", err);
    }
  };

  const fetchDistricts = async (stateCode, type) => {
    try {
      const res = await axios.get(
        `${LOCATION_API}/districts?state_code=${stateCode}`,
      ); // districts

      setDistricts((prev) => ({
        ...prev,
        [type]: res.data || [],
      }));
    } catch (err) {
      console.error("Error fetching districts", err);
    }
  };
  useEffect(() => {
    if (!profile.addresses) return;

    profile.addresses.forEach((addr) => {
      if (addr.country_code) {
        fetchStates(addr.country_code, addr.type);
      }

      if (addr.state_code) {
        fetchDistricts(addr.state_code, addr.type);
      }
    });
  }, [profile.addresses]);
  useEffect(() => {
    if (!access_token) return;

    Promise.all([fetchProfile(), fetchInterests(), fetchCountries()]).finally(
      () => setLoading(false),
    );
  }, [access_token, userAuth.username]);
  const handleImagePreview = (e) => {
    const img = e.target.files[0];
    if (img) setUpdatedProfileImg(img);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!updatedProfileImg) return;

    const loadingToast = toast.loading("Uploading...");
    if (uploadButtonRef.current)
      uploadButtonRef.current.setAttribute("disabled", true);

    try {
      const {
        data: { uploadURL },
      } = await axios.get(`${UPLOAD_API}/get-upload-url`, {
        params: { fileType: updatedProfileImg.type },
        headers: { Authorization: `Bearer ${access_token}` },
      });

      await axios.put(uploadURL, updatedProfileImg, {
        headers: { "Content-Type": updatedProfileImg.type },
      });

      const url = new URL(uploadURL);
      const imageUrl = `${url.protocol}//${url.host}${url.pathname}`;

      await axios.post(
        `${USER_API}/update-profile-img`,
        { profile_img: imageUrl },
        { headers: { Authorization: `Bearer ${access_token}` } },
      );

      setProfile({ ...profile, profile_img: imageUrl });
      setUpdatedProfileImg(null);

      const updatedUser = { ...userAuth, profile_img: imageUrl };
      setUserAuth(updatedUser);
      storeInSession("user", updatedUser);

      toast.dismiss(loadingToast);
      toast.success("Profile image updated successfully");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      if (uploadButtonRef.current)
        uploadButtonRef.current.removeAttribute("disabled");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!profile.details?.occupation_status) {
      newErrors.occupation_status = "Occupation is required";
    }

    if (!profile.bio?.trim()) {
      newErrors.bio = "Bio is required";
    }

    if (interests.length === 0) {
      newErrors.interests = "Select at least one interest";
    }

    const hasAddress =
      Array.isArray(profile.addresses) &&
      profile.addresses.some(
        (addr) =>
          addr.state_code ||
          addr.country_code ||
          addr.city?.trim() ||
          addr.street?.trim(),
      );

    if (!hasAddress) {
      newErrors.address = "Add at least one address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setErrors({});

    const form = new FormData(e.target);
    const formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    /* ---------- PROFESSION SELECTION ---------- */

    if (selectedDomain && selectedField && selectedSpecialty) {
      formData.domain_id = selectedDomain;
      formData.field_id = selectedField;
      formData.specialty_id = selectedSpecialty;
    }

    /* ---------- ADDRESS EXTRACTION ---------- */
    const ADDRESS_TYPES = ["personal", "work", "office"];
    const addressPayload = {};

    ADDRESS_TYPES.forEach((type) => {
      const addr = getAddress(type);

      addressPayload[`${type}_city`] = addr.city || null;

      //  FIX: send codes instead of names
      addressPayload[`${type}_state_code`] = addr.state_code || null;
      addressPayload[`${type}_country_code`] = addr.country_code || null;
      addressPayload[`${type}_district_code`] = addr.district_code || null;

      addressPayload[`${type}_street`] = addr.street || null;
      addressPayload[`${type}_zip_code`] = addr.zip_code || null;
    });
    const loadingToast = toast.loading("Updating profile...");

    try {
      /* ---------- USER Address UPDATE ---------- */
      await axios.post(
        `${USER_API}/update-profile`,
        {
          ...formData,
          ...addressPayload,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      /* ---------- USER Details UPDATE ---------- */

      const details = profile?.details || {};
      const occupation_status = details?.occupation_status;

      await axios.post(
        USER_DETAILS_API,
        {
          salutation: details.salutation ?? null,
          gender: details.gender ?? null,
          marital_status: details.marital_status ?? null,
          occupation_status: details.occupation_status ?? null,
          date_of_birth: details.date_of_birth ?? null,

          father_name: details.father_name ?? null,
          father_phone: details.father_phone ?? null,
          youtube: details.youtube ?? null,
          instagram: details.instagram ?? null,
          facebook: details.facebook ?? null,
          twitter: details.twitter ?? null,
          github: details.github ?? null,
          website: details.website ?? null,
          whatsapp: details.whatsapp ?? null,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      // ✅ get fresh profile
      const { data: updatedUser } = await axios.post(
        `${USER_API}/get-profile`,
        {
          username: userAuth.username,
        },
      );

      // ✅ update auth (ONLY ONCE)
      const updatedAuth = {
        ...userAuth,
        ...updatedUser,
        access_token: userAuth?.access_token,
        user_type: getUserTypeFromOccupation(
          updatedUser?.details?.occupation_status,
        ),
      };

      setUserAuth(updatedAuth);
      storeInSession("user", updatedAuth);

      const interestIds = Array.isArray(interests)
        ? interests.map((i) => i?.interest_id).filter(Boolean)
        : [];
      await axios.put(
        `${INTEREST_API}/user`,
        {
          interest_ids: interestIds,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );
      toast.dismiss(loadingToast);

      console.log("UPDATED USER:", updatedUser);
      console.log("EMP STATUS:", updatedUser?.details?.occupation_status);

      setProfile((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      // (optional if exists)
      if (updatedUser.first_name)
        updatedAuth.first_name = updatedUser.first_name;
      if (updatedUser.last_name) updatedAuth.last_name = updatedUser.last_name;

      // save to context + session
      setUserAuth(updatedAuth);
      storeInSession("user", updatedAuth);

      // after successful API calls
      toast.dismiss(loadingToast);

      if (!skipAutoSave) {
        toast.success("Profile updated successfully");
      }

      setFormSubmitted(true);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

  useEffect(() => {
    if (formSubmitted) {
      window.scrollTo({
        top: 300,
        behavior: "smooth",
      });
    }
  }, [formSubmitted]);
  const updateAddress = (type, field, value) => {
    setProfile((prev) => {
      const addresses = [...(prev.addresses || [])];

      const index = addresses.findIndex((a) => a.type === type);

      if (index !== -1) {
        addresses[index] = {
          ...addresses[index],
          [field]: value,
        };
      } else {
        addresses.push({ type, [field]: value });
      }

      return {
        ...prev,
        addresses,
      };
    });
  };

  useEffect(() => {
    setIsPublic(profile?.is_location_public);
  }, [profile]);

  const toggleLocationPrivacy = async () => {
    try {
      const { data } = await axios.post(
        `${USER_API}/toggle-location-privacy`,
        { is_public: !isPublic },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      // RESET onboarding success state
      setFormSubmitted(false);
      setIsPublic(data.is_location_public);

      toast.success(
        data.is_location_public
          ? "Location is now Public"
          : "Location is now Private",
      );
    } catch (err) {
      toast.error("Failed to update privacy");
    }
  };

  return (
    <AnimationWrapper>
      <form
        onSubmit={handleSubmit}
        className="w-full px-2 sm:px-2 lg:px-0 py-0"
      >
        <Toaster />
        {isOnboarding && formSubmitted && (
          <div className="mb-2 p-3 rounded-lg bg-green-50 border border-green-300 shadow-md flex items-center justify-between gap-3 animate-fade-in">
            <p className="text-sm text-green-800 font-semibold">
              ✅ Profile saved successfully. Continue to the next step.
            </p>

            <button
              type="button"
              onClick={onNext}
              className="text-sm px-4 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition shadow"
            >
              Continue →
            </button>
          </div>
        )}
        <h1 className="hidden md:block text-lg font-semibold leading-tight m-0">
          {isOnboarding ? "Add Profile" : "Edit Profile"}
        </h1>

        <div className="flex flex-col gap-2">
          {/* IMAGE SECTION (FULL WIDTH) */}
          <ProfileImageSection
            updatedProfileImg={updatedProfileImg}
            profile_img={profile_img}
            handleImagePreview={handleImagePreview}
            handleImageUpload={handleImageUpload}
            setUpdatedProfileImg={setUpdatedProfileImg}
            isPublic={isPublic}
            toggleLocationPrivacy={toggleLocationPrivacy}
          />

          {/* FORM AREA */}
          <div className="space-y-1 sm:space-y-[6px]">
            <BasicInfoSection
              profile={profile}
              setProfile={setProfile}
              access_token={access_token}
            />
            <BioSection
              bio={bio}
              bioLimit={bioLimit}
              handleCharacterChange={handleCharacterChange}
              error={errors.bio}
            />
            <PersonalDetailsSection
              profile={profile}
              setProfile={setProfile}
              setUserAuth={setUserAuth}
              errors={errors}
            />
            <InterestsSection
              interests={interests}
              setInterests={setInterests}
              fetchSuggestions={fetchSuggestions} // must return TREE
              error={errors.interests}
              clearError={() =>
                setErrors((prev) => ({ ...prev, interests: null }))
              }
            />
            {errors.address && (
              <p className="text-xs text-red-500 px-1">{errors.address}</p>
            )}
            {[
              { type: "personal", title: "Personal Address" },
              { type: "office", title: "Office Address" },
              { type: "work", title: "Work Address" },
            ].map((addr) => (
              <AddressSection
                key={addr.type}
                title={addr.title}
                type={addr.type}
                data={getAddress(addr.type)}
                updateAddress={updateAddress}
                countries={countries}
                states={states[addr.type] || []}
                districts={districts[addr.type] || []}
                fetchStates={fetchStates}
                fetchDistricts={fetchDistricts}
              />
            ))}

            <SocialLinksSection profile={profile} setProfile={setProfile} />
            {/* SAVE BUTTON */}
            <div className="sticky bottom-0 left-0 w-full bg-white/80 backdrop-blur border-t px-4 py-0.5 flex items-center justify-between gap-3">
              {/* TEXT */}
              <p className="text-xs text-gray-500 whitespace-nowrap">
                {isOnboarding
                  ? "Ready to complete your profile?"
                  : "Ready to update your profile?"}
              </p>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isOnboarding && !isFormValid}
                className={`text-sm px-5 py-2 rounded-full transition shadow-sm ${
                  isOnboarding
                    ? isFormValid
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                }`}
              >
                {isOnboarding ? "Submit" : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default EditProfile;
