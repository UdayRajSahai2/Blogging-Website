import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import AnimationWrapper from "../../common/page-animation";
import Loader from "../../components/loader.component";
import PageNotFound from "../404.page";

import { UserContext } from "../../App";
import { filterPaginationData } from "../../common/filter-pagination-data";
import { BLOG_API, USER_API, PROFESSIONAL_PROFILE_API } from "../../common/api";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileContainer from "../../components/profile/ProfileContainer";
import ProfileTabs from "../../components/profile/ProfileTabs";

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
  //  GLOBAL LOCATION TRACKING (FIXED)
  useLocationTracker(isOwner ? userAuth?.access_token : null);

  const fetchExperiences = async (user_id) => {
    try {
      const res = await axios.get(`${PROFESSIONAL_PROFILE_API}/${user_id}`);

      setExperiences(res.data.data?.experiences || []);
    } catch (err) {}
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
        ? { user_id: Number(profileId) } // ✅ FIX
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
        console.log("🔄 Refreshing profile location...");

        if (!profileId) return;

        // 🔥 FIX: detect id vs username
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
        <ProfileHeader profile={profile} isOwner={isOwner} goBack={goBack} />

        {/* ================= PROFILE CONTENT ================= */}
        {userAuth?.access_token ? (
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
          />
        ) : (
          /* ================= GUEST VIEW ================= */
          <div className="mt-6 text-center text-sm text-gray-500 border-t pt-4">
            <p>Sign in to view full profile details</p>

            <div className="mt-2 flex justify-center gap-3">
              <Link
                to="/signin"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-indigo-600 font-medium hover:underline"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </ProfileContainer>
    </AnimationWrapper>
  );
};

export default ProfilePage;
