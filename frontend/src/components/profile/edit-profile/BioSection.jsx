import { PencilSquareIcon } from "@heroicons/react/24/outline";

const BioSection = ({ bio = "", bioLimit = 150, handleCharacterChange }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm group">
      {/* HEADER */}
      <div className="flex items-center gap-2 text-gray-500">
        <PencilSquareIcon className="w-4 h-4 group-focus-within:text-indigo-500 transition" />
        <label className="text-xs font-semibold uppercase">Bio</label>
      </div>

      {/* TEXTAREA */}
      <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100">
        <textarea
          name="bio"
          value={bio}
          maxLength={bioLimit}
          onChange={handleCharacterChange}
          placeholder="Tell people about yourself..."
          className="w-full resize-none outline-none text-[13px] bg-transparent px-2 py-2 h-20 placeholder:text-gray-400"
        />
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-1 text-[11px] text-gray-500">
        <span className="text-gray-500">Max {bioLimit} characters</span>

        <span>
          {bio.length}/{bioLimit}
        </span>
      </div>
    </div>
  );
};

export default BioSection;
