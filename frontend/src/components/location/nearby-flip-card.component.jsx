import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../../App";
import {
  UserIcon,
  HeartIcon,
  CakeIcon,
  BriefcaseIcon,
  MapPinIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
const NearbyFlipCard = ({
  user,
  next,
  prev,
  total = 1,
  isAnimating = false,
}) => {
  const { userAuth = {} } = useContext(UserContext) || {};
  const [flipped, setFlipped] = useState(false);

  const {
    user_id,
    fullname,
    username,
    profile_img,
    bio,
    distance,
    profile_id,
    profession,
    experiences,
    details = {},
    display_location,
  } = user;
  const getLatestExperience = (experiences = []) => {
    if (!experiences.length) return null;

    const current = experiences.find((exp) => exp.is_current);
    if (current) return current;

    return [...experiences].sort(
      (a, b) => new Date(b.start_date) - new Date(a.start_date),
    )[0];
  };
  const { gender, marital_status, date_of_birth } = details;
  const salutation = user?.details?.salutation || "";
  const latestExp = getLatestExperience(experiences || []);

  const professionDisplay = latestExp?.designation || profession?.name || "";

  const isCurrentUser = user_id === userAuth?.user_id;
  const toggleFlip = () => setFlipped((f) => !f);
  const formattedDOB = date_of_birth
    ? new Date(date_of_birth).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const meta = [
    gender && capitalize(gender),
    marital_status && capitalize(marital_status),
    formattedDOB,
  ].filter(Boolean);
  return (
    <div
      tabIndex={0}
      className="relative w-full h-full perspective-[1000px] group rounded-md focus-visible:ring-2 focus-visible:ring-purple-500 cursor-pointer"
      aria-label={`${fullname}${
        distance ? `, ${distance.toFixed(1)} km away` : ""
      }`}
      onClick={toggleFlip}
    >
      {/* Flip container */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out
  [transform-style:preserve-3d]
  ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* FRONT */}
        <div className=" absolute inset-0 bg-white border rounded-sm p-3 grid grid-cols-[64px,1fr] gap-3 [backface-visibility:hidden] shadow-sm">
          <img
            src={profile_img}
            alt={fullname}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-purple/20"
          />

          <div className="flex flex-col justify-start">
            <div className="flex items-center gap-2">
              <div className="flex items-center flex-wrap gap-1 text-sm md:text-base font-semibold leading-tight -mt-2">
                <span className="truncate">
                  {salutation ? `${salutation}. ` : ""}
                  {fullname}
                </span>
                {isCurrentUser && meta.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 mt-0.5 text-[10px] text-gray-500">
                    {gender && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-indigo-400" />
                        {capitalize(gender)}
                      </span>
                    )}

                    {marital_status && (
                      <span className="flex items-center gap-1">
                        <HeartIcon className="w-3 h-3 text-pink-400" />
                        {capitalize(marital_status)}
                      </span>
                    )}

                    {formattedDOB && (
                      <span className="flex items-center gap-1">
                        <CakeIcon className="w-3 h-3 text-orange-400" />
                        {formattedDOB}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {profile_id && (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-purple/10 text-purple font-semibold">
                  {profile_id}
                </span>
              )}
            </div>
            {/* Profession */}
            {professionDisplay ? (
              <div className="flex items-center gap-1.5 text-sm text-indigo-600">
                <BriefcaseIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="truncate max-w-[200px]">
                  {professionDisplay}
                </span>
              </div>
            ) : (
              username && (
                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                  @{username}
                </p>
              )
            )}

            {/* Bio */}
            {bio && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="line-clamp-1">{bio}</span>
              </div>
            )}

            {/* Location */}
            {(display_location || distance !== undefined) && (
              <div className="flex items-center gap-1 mt-1 text-[12px] text-gray-500">
                <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />

                {display_location && (
                  <span className="truncate max-w-[220px]">
                    {display_location}
                  </span>
                )}

                {display_location && distance !== undefined && (
                  <span className="text-gray-300">•</span>
                )}

                {distance !== undefined && (
                  <span className="text-gray-600 font-normal">
                    {distance.toFixed(1)} km
                  </span>
                )}
              </div>
            )}
            {/* Flip Hint */}
            <span className="absolute bottom right-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block pointer-events-none">
              Click to flip
            </span>
            <span className="absolute bottom-2 right-2 text-[10px] text-gray-400 sm:hidden pointer-events-none">
              Tap to flip
            </span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple/10 to-blue-50 border border-purple/20 rounded-xl p-3 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Info */}
          <div>
            {professionDisplay && (
              <p className="text-xs text-purple font-semibold mb-1">
                {professionDisplay}
              </p>
            )}

            <p className="text-sm line-clamp-1 text-dark-grey/90">
              {bio || "View profile to learn more."}
            </p>
          </div>

          {/* Actions */}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <Link
              to={`/user/${user_id}`}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold text-purple bg-purple/10 hover:bg-purple/20 transition-colors"
            >
              View profile
            </Link>
          </div>
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      {total > 1 && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            aria-label="Previous"
            disabled={isAnimating}
            onClick={(e) => {
              e.stopPropagation();
              prev?.();
            }}
            onMouseEnter={() => setFlipped(false)}
            className="pointer-events-auto w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm shadow hover:bg-white flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <button
            aria-label="Next"
            disabled={isAnimating}
            onClick={(e) => {
              e.stopPropagation();
              next?.();
            }}
            onMouseEnter={() => setFlipped(false)}
            className="pointer-events-auto w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm shadow hover:bg-white flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyFlipCard;
