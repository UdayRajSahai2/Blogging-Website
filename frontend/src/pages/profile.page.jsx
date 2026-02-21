import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import AboutUser from "../components/about.component";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import VolunteerDashboard from "../components/volunteer-dashboard.component";
import PageNotFound from "./404.page";

import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { BLOG_API, USER_API } from "../common/api";

export const profileDataStructure = {
  fullname: "",
  username: "",
  profile_img: "",
  bio: "",
  total_posts: 0,
  total_reads: 0,
  social_links: {
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: "",
  },
  createdAt: "",
  user_id: null,
};

const ProfilePage = () => {
  const { id: profileId } = useParams();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");
  const [error, setError] = useState(false);

  const {
    fullname,
    username: profile_username,
    profile_img,
    bio,
    total_posts,
    total_reads,
    social_links,
    createdAt,
    user_id,
  } = profile;

  const {
    userAuth: { username: loggedInUsername },
  } = useContext(UserContext);

  // ---------------- FETCH PROFILE ----------------
  const fetchUserProfile = async () => {
    try {
      const { data: user } = await axios.post(`${USER_API}/get-profile`, {
        username: profileId,
      });

      if (!user) throw new Error("User not found");

      setProfile({
        ...user,
        social_links: {
          youtube: user.youtube,
          facebook: user.facebook,
          instagram: user.instagram,
          twitter: user.twitter,
          github: user.github,
          website: user.website,
        },
      });

      setProfileLoaded(profileId);
      getBlogs({ user_id: user.user_id });
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH BLOGS ----------------
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

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
      setProfile(profileDataStructure);
      setLoading(true);
      fetchUserProfile();
    }
  }, [profileId]);

  // ---------------- UI STATES ----------------
  if (loading) return <Loader />;
  if (error || !profile_username) return <PageNotFound />;

  return (
    <AnimationWrapper>
      <section className="h-cover md:flex gap-8 items-start">
        {/* ---------------- LEFT / MAIN CONTENT ---------------- */}
        <main className="w-full md:w-[65%] max-md:mt-10">
          <InPageNavigation
            routes={
              loggedInUsername === profile_username
                ? ["Blogs", "Volunteer & Donor", "About"]
                : ["Blogs", "About"]
            }
            defaultHidden={["About"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => (
                  <AnimationWrapper
                    key={blog.blog_id || i}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <BlogPostCard content={blog} author={blog.blogAuthor} />
                  </AnimationWrapper>
                ))
              ) : (
                <NoDataMessage message="No blogs published yet" />
              )}

              <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
            </>

            {loggedInUsername === profile_username && <VolunteerDashboard />}

            {/* Mobile About */}
            <AboutUser
              className="md:hidden mt-10"
              bio={bio}
              social_links={social_links}
              joinedAt={createdAt}
            />
          </InPageNavigation>
        </main>

        {/* ---------------- RIGHT / PROFILE SIDEBAR ---------------- */}
        <aside
          className="flex flex-col items-center md:items-start gap-5 
                          md:w-[35%] min-w-[260px] md:sticky md:top-[100px]
                          md:pl-8 md:border-l border-grey md:py-10"
        >
          <img
            src={profile_img || "/default-avatar.png"}
            alt={profile_username}
            className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover bg-grey"
          />

          <h1 className="text-xl font-semibold">@{profile_username}</h1>
          <p className="text-gray-600 capitalize">{fullname}</p>

          <p className="text-sm text-gray-500">
            {total_posts.toLocaleString()} Blogs ·{" "}
            {total_reads.toLocaleString()} Reads
          </p>

          {profileId === loggedInUsername && (
            <Link
              to="/settings/edit-profile"
              className="btn-light rounded-md mt-2"
            >
              Edit Profile
            </Link>
          )}

          {/* Desktop About */}
          <AboutUser
            className="hidden md:block"
            bio={bio}
            social_links={social_links}
            joinedAt={createdAt}
          />
        </aside>
      </section>
    </AnimationWrapper>
  );
};

export default ProfilePage;
