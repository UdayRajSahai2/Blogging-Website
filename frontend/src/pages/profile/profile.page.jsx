import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import AnimationWrapper from "../../common/page-animation";
import Loader from "../../components/loader.component";
import PageNotFound from "../404.page";

import { UserContext } from "../../App";
import { filterPaginationData } from "../../common/filter-pagination-data";
import { BLOG_API, USER_API } from "../../common/api";
import { getProfessionalProfileByUser } from "../../api/professionalProfile.api";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileContainer from "../../components/profile/ProfileContainer";
import ProfileTabs from "../../components/profile/ProfileTabs";
import SimilarProfiles from "../../components/profile/SimilarProfiles";
import { useRef } from "react";
import PrintableProfile from "../../components/profile/PrintableProfile";
//  IMPORT HOOK
import useLocationTracker from "../../hooks/useLocationTracker";

/* ---------------- PROFILE STRUCTURE ---------------- */

export const profileDataStructure = {
  fullname: "",
  username: "",
  profile_img: "",
  bio: "",
  total_posts: 0,
  total_reads: 0,
  profile_id: null,

  // LOCATION FIELDS
  current_latitude: null,
  current_longitude: null,
  display_location: "",

  details: {
    gender: "",
    marital_status: "",
    employment_status: null,
    date_of_birth: "",
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: "",
    whatsapp: "",
  },

  addresses: [],
  createdAt: "",
  user_id: null,
};

/* ---------------- PROFILE PAGE ---------------- */

const ProfilePage = ({ username, goBack }) => {
  const params = useParams();
  const profileId = username || params.id;

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);

  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("about");

  const { username: profile_username } = profile;

  const { userAuth } = useContext(UserContext);
  const loggedInUsername = userAuth?.username;
  const isOwner = loggedInUsername === profile_username;
  const [experiences, setExperiences] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [interests, setInterests] = useState([]);
  const printRef = useRef(null);
  //  GLOBAL LOCATION TRACKING (FIXED)
  useLocationTracker(isOwner ? userAuth?.access_token : null);

  const fetchExperiences = async (user_id) => {
    try {
      const res = await getProfessionalProfileByUser(user_id);

      setExperiences(res.data.data?.experiences || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAcademics = async (user_id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/academics/user/${user_id}`,
      );

      setAcademics(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch academics", err);
    }
  };

  /* ---------------- FETCH PROFILE ---------------- */

  const fetchUserProfile = async () => {
    try {
      const isNumeric = !isNaN(profileId);

      const payload = isNumeric
        ? { user_id: Number(profileId) } //  FIX
        : { username: profileId };

      const { data: user } = await axios.post(
        `${USER_API}/get-profile`,
        payload,
      );

      if (!user || !user.username) {
        throw new Error("User not found");
      }

      setProfile({
        ...user,
        details: user.details || {},
        addresses: user.addresses || [],
      });

      setExperiences(user.experiences || []);
      setAcademics(user.academics || []);
      setInterests(user.interests || []);
      setProfileLoaded(profileId);

      getBlogs({ user_id: user.user_id });

      setError(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH BLOGS ---------------- */

  const getBlogs = async ({ page = 1, user_id }) => {
    const finalUserId = user_id ?? blogs?.user_id;
    if (!finalUserId) return;

    try {
      const { data } = await axios.post(`${BLOG_API}/search-blogs`, {
        author: finalUserId,
        page,
      });

      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: `${BLOG_API}/search-blogs-count`,
        data_to_send: { author: finalUserId },
      });

      formattedData.user_id = finalUserId;

      setBlogs(formattedData);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
      setProfile({ ...profileDataStructure });
      setLoading(true);

      fetchUserProfile();
    }
  }, [profileId]);

  // ADD THIS
  useEffect(() => {
    const refreshProfileLocation = async () => {
      try {
        if (!profileId) return;

        // FIX: detect id vs username
        const isNumeric = !isNaN(profileId);

        const payload = isNumeric
          ? { user_id: Number(profileId) }
          : { username: profileId };

        const { data } = await axios.post(`${USER_API}/get-profile`, payload);

        setProfile((prev) => ({
          ...prev,
          display_location: data.display_location,
          current_city: data.current_city,
          current_state: data.current_state,
          current_country: data.current_country,
          current_latitude: data.current_latitude,
          current_longitude: data.current_longitude,
        }));
      } catch (err) {
        console.error("Location refresh failed:", err);
      }
    };

    window.addEventListener("location-updated", refreshProfileLocation);

    return () => {
      window.removeEventListener("location-updated", refreshProfileLocation);
    };
  }, [profileId]);

  /* ---------------- UI STATES ---------------- */

  const personal = profile.addresses?.find((a) => a.type === "personal") || {};

  const professional =
    profile.addresses?.find((a) => a.type === "professional") || {};

  if (loading) return <Loader />;
  if (error || !profile_username) return <PageNotFound />;

  /* ---------------- UI ---------------- */

  return (
    <AnimationWrapper>
      <ProfileContainer embedded={!!goBack}>
        {/* ================= HEADER (ALWAYS VISIBLE) ================= */}
        <ProfileHeader
          profile={profile}
          experiences={experiences}
          isOwner={isOwner}
          goBack={goBack}
          printRef={printRef}
        />

        {/* ================= PROFILE CONTENT ================= */}
        {userAuth?.access_token ? (
          <>
            <ProfileTabs
              tab={tab}
              setTab={setTab}
              blogs={blogs}
              getBlogs={getBlogs}
              isOwner={isOwner}
              bio={profile.bio}
              social_links={profile.details}
              details={profile.details}
              createdAt={profile.createdAt}
              addresses={profile.addresses}
              experiences={profile.experiences}
              academics={profile.academics}
              interests={interests}
              userId={profile.user_id} // <-- add
            />
          </>
        ) : (
          /* ================= GUEST VIEW ================= */
          <div className="mt-2 border-t pt-2 text-center">
            <p className="text-sm text-gray-500">
              Login in or create an account to view full profile details and
              connect with other users.
            </p>

            <div className="mt-2 mb-2 flex justify-center gap-3">
              <Link
                to="/signin"
                className="rounded-lg border border-slate-400 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-purple px-2 py-1 text-sm text-white hover:bg-slate-900"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </ProfileContainer>
      {/*  SIMILAR PROFILES*/}
      <div
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
        }}
      >
        <div ref={printRef}>
          <PrintableProfile
            profile={profile}
            interests={interests}
            isOwner={isOwner}
          />
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default ProfilePage;
