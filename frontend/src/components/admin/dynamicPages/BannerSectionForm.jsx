// frontend/src/components/admin/pages/BannerSectionForm.jsx
import axios from "axios";
import { uploadImage } from "../../../common/aws";
import { UPLOAD_API } from "../../../common/api";
import { compressImage } from "../../../common/compressImage";
import { XMarkIcon } from "@heroicons/react/24/solid";
const inputClass =
  "w-full border border-gray-300 px-2.5 py-1.5 text-xs outline-none focus:border-gray-500";

const labelClass = "mb-1 block text-xs font-medium text-gray-700";

const helperClass = "mb-1 text-xs text-gray-500";

const buttonClass =
  "border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50";

const BannerSectionForm = ({ section, onChange }) => {
  const handleChange = (e) => {
    onChange({
      ...section,
      [e.target.name]: e.target.value,
    });
  };

  /* ADD STAT */
  const addStat = () => {
    onChange({
      ...section,

      stats: [
        ...(section.stats || []),

        {
          value: "",
          label: "",
        },
      ],
    });
  };

  /* UPDATE STAT */
  const updateStat = (index, field, value) => {
    const updatedStats = [...(section.stats || [])];

    updatedStats[index][field] = value;

    onChange({
      ...section,
      stats: updatedStats,
    });
  };

  /* REMOVE STAT */
  const removeStat = (index) => {
    const updatedStats = section.stats.filter((_, i) => i !== index);

    onChange({
      ...section,
      stats: updatedStats,
    });
  };

  return (
    <div className="space-y-5">
      {/* INFO */}
      <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
        Main top banner section shown on page.
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="space-y-3">
          {/* TITLE */}
          <div>
            <label className={labelClass}>Banner Title</label>

            <p className={helperClass}>Main heading shown on page</p>

            <input
              type="text"
              name="title"
              value={section.title || ""}
              onChange={handleChange}
              className={inputClass}
              placeholder="Welcome to Our Website"
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className={labelClass}>Banner Image</label>

            <p className={helperClass}>Click image to upload or replace</p>

            <label
              className="
              group
              relative
              flex
              h-[160px]
              w-[160px]
              cursor-pointer
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              transition
              hover:border-gray-400
            "
            >
              {/* IMAGE */}
              {section.image ? (
                <img
                  src={section.image}
                  alt="Banner"
                  className="
                  h-full
                  w-full
                  object-contain
                "
                />
              ) : (
                <div
                  className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-gray-400
                "
                >
                  <span className="text-3xl">＋</span>

                  <span className="mt-1 text-[11px]">Add Banner</span>
                </div>
              )}

              {/* OVERLAY */}
              <div
                className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/40
                opacity-0
                transition
                group-hover:opacity-100
              "
              >
                <span className="text-xs text-white">Change Image</span>
              </div>

              {/* REMOVE BUTTON */}
              {section.image && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();

                    try {
                      if (section.image_key) {
                        await axios.delete(`${UPLOAD_API}/delete`, {
                          data: {
                            key: section.image_key,
                          },
                        });
                      }

                      onChange({
                        ...section,
                        image: "",
                        image_key: "",
                      });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="
                  absolute
                  right-2
                  top-2
                  z-10
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-black/60
                  text-white
                  opacity-0
                  backdrop-blur-sm
                  transition
                  group-hover:opacity-100
                  hover:bg-red-600
                "
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}

              {/* INPUT */}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files[0];

                  if (!file) return;

                  try {
                    const compressedFile = await compressImage(file, {
                      maxSizeMB: 0.8,
                      maxWidthOrHeight: 1600,
                    });

                    compressedFile.name = file.name;

                    const { fileURL, key } = await uploadImage(
                      compressedFile,
                      "admin-content/banner-images",
                    );

                    onChange({
                      ...section,
                      image: fileURL,
                      image_key: key,
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelClass}>Banner Description</label>

            <span className="text-xs text-gray-400">
              {(section.description || "").length}/1300
            </span>
          </div>

          <p className={helperClass}>Max 1300 characters</p>

          <textarea
            name="description"
            value={section.description || ""}
            onChange={handleChange}
            rows={9}
            maxLength={1300}
            className={`${inputClass} resize-none h-full min-h-[250px]`}
            placeholder="Write banner description..."
          />
        </div>
      </div>

      {/* STATS */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <label className={labelClass}>Statistics</label>

            <div className="flex items-center gap-2">
              <p className={helperClass}>
                Highlight important numbers (Max 3){" | "}
                {(section.stats || []).length}/3
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addStat}
            disabled={(section.stats || []).length >= 3}
            className={`
        ${buttonClass}
        ${
          (section.stats || []).length >= 3
            ? "cursor-not-allowed opacity-50"
            : ""
        }
      `}
          >
            + Add Stat
          </button>
        </div>

        {/* STATS ROW */}
        <div className="flex w-full flex-wrap gap-3">
          {(section.stats || []).map((stat, index) => (
            <div
              key={index}
              className="
                          flex-1
                          min-w-[320px]
                          flex
                          items-end
                          gap-2
                          border
                          border-gray-200
                          p-3
                             "
            >
              {/* VALUE */}
              <div>
                <label className={labelClass}>Value</label>

                <input
                  type="text"
                  value={stat.value || ""}
                  onChange={(e) => updateStat(index, "value", e.target.value)}
                  className="
              w-32
              border
              border-gray-300
              px-2.5
              py-1.5
              text-xs
              outline-none
              focus:border-gray-500
            "
                  placeholder="500+"
                />
              </div>

              {/* LABEL */}
              <div>
                <label className={labelClass}>Label</label>

                <input
                  type="text"
                  value={stat.label || ""}
                  onChange={(e) => updateStat(index, "label", e.target.value)}
                  className="
              w-32
              border
              border-gray-300
              px-2.5
              py-1.5
              text-xs
              outline-none
              focus:border-gray-500
            "
                  placeholder="Projects"
                />
              </div>

              {/* REMOVE */}
              <button
                type="button"
                onClick={() => removeStat(index)}
                className="
            mb-1
            text-xs
            font-medium
            text-red-600
            hover:text-red-700
          "
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* GALLERY */}
      <div>
        <label className={labelClass}>Description Images</label>

        <div className="mb-1 flex items-center justify-between">
          <p className={helperClass}>
            Upload maximum 3 images below description {" | "}
            {(section.gallery || []).length}/3
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* ADD IMAGE BOX */}
          <label
            className={`
        flex
        h-20
        w-20
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        text-xs
        transition

        ${
          (section.gallery || []).length >= 3
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-300"
            : "cursor-pointer border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100"
        }
      `}
          >
            <div className="text-center">
              <div className="text-lg">＋</div>

              <div className="text-[10px]">Add</div>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={(section.gallery || []).length >= 3}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);

                if (!files.length) return;

                const remaining = 3 - (section.gallery?.length || 0);

                if (remaining <= 0) return;

                const limitedFiles = files.slice(0, remaining);

                try {
                  const uploadedImages = await Promise.all(
                    limitedFiles.map(async (file) => {
                      const compressedFile = await compressImage(file, {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1200,
                      });

                      return uploadImage(
                        compressedFile,
                        "admin-content/banner-images",
                      );
                    }),
                  );

                  onChange({
                    ...section,

                    gallery: [
                      ...(section.gallery || []),

                      ...uploadedImages.map((img) => img.fileURL),
                    ],
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </label>

          {/* IMAGES */}
          {section.gallery?.map((img, index) => (
            <div
              key={index}
              className="
          group
          relative
          h-20
          w-20
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-gray-50
        "
            >
              <img
                src={img}
                alt={`Gallery ${index}`}
                className="
            h-full
            w-full
            object-contain
          "
              />

              {/* REMOVE */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const imageUrl = section.gallery[index];

                    const key = imageUrl.split(".amazonaws.com/")[1];

                    if (key) {
                      await axios.delete(`${UPLOAD_API}/delete`, {
                        data: { key },
                      });
                    }

                    onChange({
                      ...section,

                      gallery: section.gallery.filter((_, i) => i !== index),
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="
            absolute
            right-1
            top-1
            z-10
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-black/60
            text-white
            opacity-0
            backdrop-blur-sm
            transition
            group-hover:opacity-100
            hover:bg-red-600
          "
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default BannerSectionForm;
