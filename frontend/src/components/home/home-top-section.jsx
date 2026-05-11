import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import BlogCarousel from "../blog/blog-carousel.component";
import NearbyCarousel from "../location/nearby-carousel.component";
import NearbyMap from "../location/nearby-map.component";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { UserContext } from "../../App";
import useLocationTracker from "../../hooks/useLocationTracker";
import { USER_API } from "../../common/api";

const HomeTopSection = ({ pageState }) => {
  const { userAuth } = useContext(UserContext);

  useLocationTracker(userAuth?.access_token);

  // ---------------- STATE ----------------
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState("");

  const hasFetched = useRef(false); // prevent double calls

  // ---------------- FETCH USERS ----------------
  const fetchUsersFromCoords = async (latitude, longitude) => {
    try {
      const { data } = await axios.post(`${USER_API}/find-nearby-users`, {
        latitude,
        longitude,
        radius_km: 30,
        limit: 24,
        include_non_public: true,
      });

      setNearbyUsers(data?.users || []);
    } catch (err) {
      console.error("Nearby users fetch error:", err);
      setLocationError("Failed to load nearby users");
    }
  };

  // ---------------- FALLBACK ----------------
  const useFallbackLocation = async () => {
    try {
      const res = await axios.get("https://ipapi.co/json/");
      const { latitude, longitude } = res.data;

      setUserLocation({ latitude, longitude });
      await fetchUsersFromCoords(latitude, longitude);
    } catch (err) {
      console.error("Fallback location failed:", err);
      setLocationError("Unable to detect your location");
    } finally {
      setLoadingLocation(false);
    }
  };

  // ---------------- GEO SUCCESS ----------------
  const handleSuccess = async ({ coords }) => {
    const { latitude, longitude } = coords;

    setUserLocation({ latitude, longitude });
    await fetchUsersFromCoords(latitude, longitude);
    setLoadingLocation(false);
  };

  // ---------------- GEO ERROR ----------------
  const handleError = (err) => {
    console.error("Geolocation error:", err);

    //  Timeout → retry with low accuracy
    if (err.code === 3) {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        () => useFallbackLocation(),
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        },
      );
      return;
    }

    //  Permission denied or unavailable
    useFallbackLocation();
  };

  // ---------------- MAIN FETCH ----------------
  const fetchNearbyUsers = () => {
    if (!navigator.geolocation) {
      useFallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false, //  key change
      timeout: 12000, //  increase timeout
      maximumAge: 300000, // cache 5 min
    });
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchNearbyUsers();
  }, []);

  // ---------------- UI ----------------
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-y-2 lg:gap-y-0 gap-x-[2px] items-stretch max-w-[1530px] mx-auto px-[1px]">
      {/* Blog carousel */}
      <div className="lg:col-span-2 bg-white shadow-sm min-h-[240px] lg:min-h-[360px] flex flex-col">
        <div className="flex-1 w-full">
          <BlogCarousel pageState={pageState} mobileGrid />
        </div>
      </div>

      {/* People Near Me */}
      <aside className="order-2 lg:order-1 lg:sticky lg:top-20">
        <h4 className="font-medium text-base lg:text-2xl mb-3 flex items-center gap-1">
          People near me
          <MapPinIcon className="h-[20px] w-[20px]" />
        </h4>

        <div className="flex flex-col gap-1">
          {/* Carousel */}
          <div className="h-[100px] lg:h-[110px]">
            <NearbyCarousel users={nearbyUsers} intervalMs={4000} />
          </div>

          {/* Map */}
          {loadingLocation ? (
            <p className="text-center text-gray-500 text-sm py-2 animate-pulse">
              Detecting your location...
            </p>
          ) : (
            <div className="min-h-[160px] overflow-hidden border border-grey/40">
              <NearbyMap users={nearbyUsers} userLocation={userLocation} />
            </div>
          )}
        </div>
      </aside>
    </section>
  );
};

export default HomeTopSection;
