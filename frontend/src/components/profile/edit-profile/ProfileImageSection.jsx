import { useEffect, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import UserAvatar from "../../../common/UserAvatar";
const ProfileImageSection = ({
  fullname,

  updatedProfileImg,
  profile_img,
  handleImagePreview,
  handleImageUpload,
  setUpdatedProfileImg,
  isPublic,
  toggleLocationPrivacy,
}) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!updatedProfileImg) {
      setPreview(null); // FIX: reset when removed
      return;
    }

    const url = URL.createObjectURL(updatedProfileImg);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [updatedProfileImg]);

  return (
    <div className="px-3 md:p-3 flex flex-row items-start gap-4 w-full">
      {/* IMAGE (LEFT) */}
      <div className="flex flex-col items-center shrink-0">
        <label
          htmlFor="uploadImg"
          className="relative group w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 cursor-pointer border"
        >
          <UserAvatar
            src={preview || profile_img}
            name={fullname}
            className="w-full h-full"
            roundedClassName="rounded-full"
            textClassName="text-5xl font-bold tracking-tight"
          />

          <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 transition">
            Change Photo
          </div>
        </label>

        <p className="text-[11px] text-gray-500 mt-1 text-center">
          Click image to change
        </p>
      </div>

      {/* RIGHT SIDE (FULL WIDTH) */}
      <div className="flex flex-col gap-3 flex-1">
        <input
          type="file"
          id="uploadImg"
          hidden
          accept=".jpeg,.jpg,.png"
          onChange={handleImagePreview}
        />

        {/* LOCATION (FULL WIDTH, NO WASTE SPACE) */}
        <div className="flex items-center justify-between border-y px-2 py-2 rounded-md w-full">
          {/* TEXT */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="flex items-center gap-2">
              <MapPinIcon
                className={`w-4 h-4 transition ${
                  isPublic ? "text-green-500" : "text-gray-400"
                }`}
              />

              <p className="text-sm font-medium text-gray-800">
                Location Visibility
              </p>
            </div>

            <span
              className={`text-[13px] font-medium ${
                isPublic ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </span>

            <span className="text-[13px] text-gray-500">
              -{" "}
              {isPublic
                ? "Your location will be visible to nearby users on the map and can help others discover you."
                : "Your location is completely private and will not be visible to anyone else."}
            </span>
          </div>

          {/* TOGGLE */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLocationPrivacy();
            }}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
              isPublic ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                isPublic ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={async () => {
              // CHECK IMAGE FIRST
              if (!updatedProfileImg) {
                alert(
                  "Please click on the profile image and select a photo first",
                );
                return;
              }

              try {
                setLoading(true);
                await handleImageUpload();
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className={`text-xs px-4 py-1.5 rounded-full text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Uploading..." : "Save Photo"}
          </button>

          {updatedProfileImg && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setUpdatedProfileImg(null)}
              className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageSection;
