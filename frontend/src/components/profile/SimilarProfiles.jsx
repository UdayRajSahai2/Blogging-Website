import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSimilarProfiles } from "../../api/profile.api.js";
import { MapPinIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { getUserTypeBadge } from "../../utils/userBadge.js";
const SimilarProfiles = ({ userId }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSimilar = async () => {
      try {
        setLoading(true);

        const res = await getSimilarProfiles(userId);

        setProfiles(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-3 text-sm text-gray-500">
        Loading similar profiles...
      </div>
    );
  }

  if (!profiles.length) {
    return (
      <div className="p-3 text-sm text-gray-400">
        No similar profiles available
      </div>
    );
  }

  return (
    <section className="w-full ml-1">
      <div className="flex items-center">
        <h4 className="text-[14px] font-semibold text-gray-900">
          Similar Profiles
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-2 mr-2">
        {profiles.map((user) => {
          const badge = getUserTypeBadge(user.user_type);

          return (
            <Link
              key={user.user_id}
              to={`/dashboard/user/${user.username}`}
              className="
  group relative block overflow-hidden
  rounded-xl
  border border-gray-300/60
  bg-white/70
  backdrop-blur-xl
  p-1.5
  transition-all duration-300
  hover:border-indigo-200
  hover:shadow-xl
  hover:shadow-indigo-100/40
"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                {user.profile_img ? (
                  <img
                    src={user.profile_img}
                    alt={user.fullname}
                    className="h-12 w-12 rounded-md object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.fullname?.charAt(0) || "U"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="truncate text-sm font-semibold text-gray-900">
                      {user.fullname || user.username}
                    </h5>

                    {badge && (
                      <span
                        className="
              flex-shrink-0 rounded-full
              bg-gradient-to-r from-cyan-500 to-cyan-700
              px-2 py-0.5
              text-[10px] font-medium text-white
            "
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="mt-1 h-4 flex items-center gap-1">
                    {user.display_location && (
                      <>
                        <MapPinIcon className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                        <p className="truncate text-[11px] text-gray-500">
                          {user.display_location}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/*  Bio Section */}
              <div className="mt-3 border-t border-gray-100 pt-2">
                <div className="flex items-start gap-2">
                  <DocumentTextIcon className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-1 text-[11px] text-gray-600">
                    {user.bio || "No bio available"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarProfiles;
