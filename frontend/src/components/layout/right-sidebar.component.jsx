import { DONOR_API } from "../../common/api";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

const RightSidebar = () => {
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const [donorProfile, setDonorProfile] = useState(null);

  const fetchDonorProfile = async () => {
    try {
      const response = await axios.get(`${DONOR_API}/donor-profile`, {
        headers: {
          Authorization: `Bearer ${userAuth?.access_token}`,
        },
      });

      const donor = response.data?.donor || response.data?.data?.donor;
      setDonorProfile(donor || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setDonorProfile(null);
      }
    }
  };

  useEffect(() => {
    if (userAuth?.access_token) {
      fetchDonorProfile();
    }
  }, [userAuth]);

  return (
    <div className="order-3 w-full lg:sticky lg:top-20">
      <div className="flex flex-col gap-2 w-full">
        <div className="rounded-lg p-3 sm:p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
          <p className="text-lg font-semibold text-emerald-700 mb-2">
            Join as a Donor
          </p>

          {/* NOT LOGGED IN */}
          {!userAuth?.access_token && (
            <p className="text-dark-grey text-sm">Sign in to become a donor</p>
          )}

          {/* LOGGED IN */}
          {userAuth?.access_token && (
            <div className="space-y-2">
              {donorProfile ? (
                <>
                  <p className="text-emerald-600 text-sm">
                    ✅ Registered as {donorProfile.subscription_type} donor
                  </p>

                  <p className="text-dark-grey text-xs">
                    Cause: {donorProfile.purpose}
                  </p>
                </>
              ) : (
                <p className="text-dark-grey text-sm">
                  Join our community of donors
                </p>
              )}

              {/* ✅ SINGLE NAVLINK */}
              <NavLink
                to="/dashboard/donor"
                className="w-full bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm text-center block hover:bg-emerald-600"
              >
                {donorProfile ? "Make a donation" : "Register as Donor"}
              </NavLink>
            </div>
          )}
        </div>

        {/* EDUCATION */}
        <div className="rounded-lg p-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
          <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
            Education
          </p>
        </div>

        {/* SOCIAL */}
        <div className="rounded-lg p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100 shadow-sm">
          <p className="text-lg font-semibold text-emerald-700 mb-1">
            Social Initiative
          </p>
          <p className="text-sm text-gray-600">
            Support community drives and social campaigns.
          </p>
        </div>

        {/* SPORTS + NEWS GRID */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-3 bg-white border shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-400 mb-1">Sports</p>
            <p className="text-sm font-semibold text-gray-800">
              Local Marathon 2026
            </p>
          </div>

          {/* NEWS */}
          <div className="rounded-lg p-3 bg-white border shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-400 mb-1">News</p>
            <p className="text-sm font-semibold text-gray-800">Tech Startup</p>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="rounded-xl p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-100 shadow-sm">
          <p className="text-xs text-orange-500 mb-1">Products</p>
          <p className="text-sm font-semibold text-orange-700">
            Promote Your Product
          </p>
          <p className="text-xs text-gray-600">Showcase your product.</p>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
