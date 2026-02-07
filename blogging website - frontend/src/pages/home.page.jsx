import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import "../index.css";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import BlogCarousel from "../components/blog-carousel.component";
import NearbyFlipCard from "../components/nearby-flip-card.component";
import { useContext as useContext2, useEffect as useEffect2, useState as useState2 } from "react";
import { UserContext } from "../App";
import useLocationTracker from "../hooks/useLocationTracker";
import NearbyCarousel from "../components/nearby-carousel.component";
import NearbyMap from "../components/nearby-map.component";
import Footer from "../components/footer.component";
import DonorRegistration from "../components/donor-registration.component";
import DonationForm from "../components/donation-form.component";

const HomePage = ({ pageState, setPageState }) => {
  let [blogs, setBlog] = useState(null);
  let [trendingBlogs, setTrendingBlog] = useState(null);
  const { userAuth } = useContext2(UserContext);
  useLocationTracker(userAuth?.access_token);

  // Nearby users list (auto, no user selection)
  const [nearbyUsers, setNearbyUsers] = useState2([]);
  const [nearIndex, setNearIndex] = useState2(0);
  const [userLocation, setUserLocation] = useState2(null);
  
  // Donor functionality state
  const [showDonorRegistration, setShowDonorRegistration] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donorProfile, setDonorProfile] = useState(null);
  useEffect2(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ latitude, longitude });
          const { data } = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/find-nearby-users",
            { latitude, longitude, radius_km: 30, limit: 24, include_non_public: true }
          );
          setNearbyUsers(data.users || []);
        } catch (e) {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Auto-advance like flipping blogs
  useEffect2(() => {
    if (!nearbyUsers || nearbyUsers.length <= 2) return;
    const id = setInterval(() => {
      setNearIndex((i) => (i + 1) % nearbyUsers.length);
    }, 4000);
    return () => clearInterval(id);
  }, [nearbyUsers]);

  const fetchLatestBlogs = ({ page = 1 }) => {
    console.log("Fetching latest blogs - Page:", page);
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        console.log("Received blogs data:", data);
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });
        console.log("Formatted data:", formatedData);
        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        console.log(data);
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });
        setBlog(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchDonorProfile = async () => {
    if (!userAuth.access_token) return;
    
    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/donor-profile",
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
      setDonorProfile(response.data.donor);
    } catch (err) {
      if (err.response?.status === 404) {
        setDonorProfile(null);
      }
    }
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }

    // Fetch donor profile if user is authenticated
    if (userAuth.access_token) {
      fetchDonorProfile();
    }
  }, [pageState, userAuth.access_token]);

  // Get display name for the current page state
  const getDisplayName = () => {
    if (pageState === "home") {
      return "Latest Blogs";
    }
    // Capitalize first letter for display
    return pageState.charAt(0).toUpperCase() + pageState.slice(1);
  };

  return (
    <AnimationWrapper>
      {/* Top row: Flipping blogs area + People near me */}
        <div className="pt-56">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 items-stretch relative z-0">
        <div className="lg:col-span-2 bg-white rounded-lg border border-grey p-2 h-[360px]">
          <div className="h-full">
            <BlogCarousel pageState={pageState} />
          </div>
        </div>
        <aside className="hidden lg:block border border-grey rounded-lg p-3 h-[500px] overflow-hidden relative z-0">
          <h2 className="font-medium text-xl mb-2 flex items-center gap-2">
            People near me
            <i className="fi fi-rr-marker"></i>
          </h2>
          {nearbyUsers == null ? (
            <Loader />
          ) : nearbyUsers.length ? (
            <NearbyMap users={nearbyUsers} userLocation={userLocation} />
          ) : (
            <NoDataMessage message="No nearby users found" />
          )}
        </aside>
      </section>
        </div>
      {/* Main layout: Left sidebar + Wide content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start -mt-36">
        {/* Left column: action tiles (kept compact to sit directly left of Latest Blogs) */}
        <div className="flex flex-col gap-4 lg:col-span-2 order-2 lg:order-1">
          <a href="/editor" className="block rounded-xl p-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <i className="fi fi-rr-file-edit text-2xl"></i>
              <div>
                <p className="text-lg font-semibold">Post your blog</p>
                <p className="text-white/90 text-sm">Share your story with everyone</p>
              </div>
            </div>
          </a>

          <div className="rounded-xl p-5 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-purple/20 shadow-sm">
            <p className="text-lg font-semibold text-purple mb-3">Top Communities of Interest</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Tech','Foodies','Travelers','Sports','Music','Anime'].map((chip) => (
                <span key={chip} className="px-3 py-1 text-xs rounded-full bg-purple/10 text-purple font-semibold">{chip}</span>
              ))}
            </div>
            <p className="text-dark-grey text-sm">Discover and join communities. (Coming soon)</p>
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
            <p className="text-lg font-semibold text-emerald-700 mb-2">Be a Volunteer / Donor</p>
            {userAuth.access_token ? (
              donorProfile ? (
                <div className="space-y-2">
                  <p className="text-emerald-600 text-sm">✅ Registered as {donorProfile.subscription_type} donor</p>
                  <p className="text-dark-grey text-xs">Cause: {donorProfile.purpose}</p>
                  <button
                    onClick={() => setShowDonationForm(true)}
                    className="w-full mt-2 bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Make Donation
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-dark-grey text-sm">Join our community of donors</p>
                  <button
                    onClick={() => setShowDonorRegistration(true)}
                    className="w-full bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Register as Donor
                  </button>
                </div>
              )
            ) : (
              <p className="text-dark-grey text-sm">Sign in to become a donor</p>
            )}
          </div>

          <div className="rounded-xl p-5 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 shadow-sm">
            <p className="text-lg font-semibold text-blue-700 mb-2">Advertise with us</p>
            <p className="text-dark-grey text-sm">Grow your reach with Connect Me. (Coming soon)</p>
          </div>

          {/* Trending issues (Marquee + list) */}
          <div className="rounded-xl p-0 bg-amber-50 border border-amber-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-amber-200/60 text-amber-900 font-semibold">Trending issues</div>
            <div className="px-4 py-3">
              <marquee behavior="scroll" direction="left" className="text-sm text-amber-800">
                New features launching soon • Community spotlight • Event week highlights • Security update • Share your blogs and events
              </marquee>
            </div>
            <div className="px-4 pb-4">
              {trendingBlogs?.slice(0,3)?.map((b,i) => (
                <div key={i} className="flex items-start gap-2 py-1">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <p className="text-sm line-clamp-2">{b.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Events grid below trending issues */}
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl p-5 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow min-h-[120px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📸</span>
                <div>
                  <p className="text-lg font-semibold mb-1">Event Photographs</p>
                  <p className="text-white/90 text-sm">flipping 1/2/3/4/5/6</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-5 bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow min-h-[120px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div>
                  <p className="text-lg font-semibold mb-1">Coming up Events</p>
                  <p className="text-white/90 text-sm">flipping 1/2/3/4/5/6</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content area on extreme right: Latest Blogs extra wide */}
        <div className="lg:col-span-10 w-full order-1 lg:order-2">
          <InPageNavigation
            routes={[getDisplayName(), "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard content={blog} author={blog.blogAuthor} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No Blogs Published" />
              )}
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            <>
              {trendingBlogs === null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No Blogs Published" />
              )}
            </>
          </InPageNavigation>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Donor Registration Modal */}
      {showDonorRegistration && (
        <DonorRegistration
          onClose={() => setShowDonorRegistration(false)}
          onSuccess={(donor) => {
            setDonorProfile(donor);
            setShowDonorRegistration(false);
          }}
        />
      )}

      {/* Donation Form Modal */}
      {showDonationForm && (
        <DonationForm
          onClose={() => setShowDonationForm(false)}
          onSuccess={() => {
            setShowDonationForm(false);
            fetchDonorProfile(); // Refresh donor profile
          }}
          donorProfile={donorProfile}
        />
      )}
    </AnimationWrapper>
  );
};

export default HomePage;