import { Link } from "react-router-dom";

const NearbyFlipCard = ({ user, index = 0 }) => {
  const {
    fullname,
    username,
    profile_img,
    bio,
    distance,
    profile_id,
    profession,
  } = user;
  const professionName = profession?.name || "";

  return (
    <div
      className="relative w-full h-32 [perspective:1000px] group focus-within:ring-2 focus-within:ring-purple-500 rounded-xl"
      aria-label={`${fullname} ${distance ? `, ${Number(distance).toFixed(1)} km away` : ""}`}
    >
      <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 bg-white border rounded-xl p-3 grid grid-cols-[64px,1fr] gap-3 [backface-visibility:hidden] shadow-sm">
          <img
            src={profile_img}
            alt={fullname}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-purple/20"
          />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <p className="font-semibold leading-tight line-clamp-1">
                {fullname}
              </p>
              {profile_id ? (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-purple/10 text-purple font-semibold">
                  {profile_id}
                </span>
              ) : null}
            </div>
            {professionName ? (
              <p className="text-sm text-purple font-medium mt-0.5 line-clamp-1">
                {professionName}
              </p>
            ) : (
              <p className="text-sm text-dark-grey">@{username}</p>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {distance !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <i className="fi fi-rr-marker" />
                  {Number(distance).toFixed(1)} km away
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple/10 to-blue-50 border border-purple/20 rounded-xl p-3 flex flex-col items-start justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div>
            {professionName ? (
              <p className="text-xs text-purple font-semibold mb-1">
                {professionName}
              </p>
            ) : null}
            <p className="text-sm line-clamp-3 mb-2 text-dark-grey/90">
              {bio || "View profile"}
            </p>
          </div>
          <Link
            to={`/user/${username}`}
            className="inline-flex items-center gap-2 text-purple font-semibold hover:underline"
          >
            View profile
            <i className="fi fi-rr-arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NearbyFlipCard;
