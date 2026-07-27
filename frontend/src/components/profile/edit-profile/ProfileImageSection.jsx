//frontend\src\components\profile\edit-profile\ProfileImageSection.jsx
import { useEffect, useState } from "react";
import { MapPinIcon, CameraIcon } from "@heroicons/react/24/solid";
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
      {/* PROFILE IMAGE */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative group">
          <label htmlFor="uploadImg" className="relative block cursor-pointer">
            <UserAvatar
              src={preview || profile_img}
              name={fullname}
              className="w-28 h-28 md:w-32 md:h-32 "
              roundedClassName="rounded-full"
              textClassName="text-5xl font-bold"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                Change photo
              </span>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            )}

            {/* Camera Button */}
            <div className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition">
              <CameraIcon className="w-4 h-4" />
            </div>
          </label>
        </div>

        <input
          type="file"
          id="uploadImg"
          hidden
          accept=".jpeg,.jpg,.png"
          onChange={handleImagePreview}
        />

        {updatedProfileImg && (
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={async () => {
                if (!updatedProfileImg) return;

                try {
                  setLoading(true);
                  await handleImageUpload();
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:bg-gray-400"
            >
              {loading ? "Uploading..." : "Save"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setUpdatedProfileImg(null)}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}
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
      </div>
    </div>
  );
};

export default ProfileImageSection;
