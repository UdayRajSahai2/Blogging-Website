import { SparklesIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const InterestsSection = ({
  interests = [],
  setInterests,
  error,
  clearError,
  fetchSuggestions, // will return FULL TREE now
}) => {
  const [tree, setTree] = useState([]);

  const [level1, setLevel1] = useState(null);
  const [level2, setLevel2] = useState(null);
  const [level3, setLevel3] = useState(null);

  // =========================
  // LOAD TREE
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSuggestions();

        // normalize response
        const normalized = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        setTree(normalized);
      } catch (err) {
        console.error("Failed to load tree", err);
        setTree([]);
      }
    };

    load();
  }, []);

  // =========================
  // ADD FINAL SELECTION
  // =========================
  const handleAdd = () => {
    if (!level3) return;

    const exists = interests.some((i) => i.interest_id === level3.interest_id);

    if (exists) return;

    setInterests((prev) => [
      ...prev,
      {
        interest_id: level3.interest_id,
        name: level3.name,
      },
    ]);

    // reset selection
    setLevel1(null);
    setLevel2(null);
    setLevel3(null);

    if (clearError) clearError();
  };

  // =========================
  //  REMOVE
  // =========================
  const handleRemove = (id) => {
    setInterests((prev) => prev.filter((i) => i.interest_id !== id));
  };

  return (
    <div
      data-error={error ? "true" : undefined}
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-2"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-indigo-500" />
        <div>
          <p className="text-base font-semibold text-gray-600">Add Interests</p>
          <p className="text-[11px] text-gray-500">
            Select what you’re interested in to personalize your profile
          </p>
        </div>
      </div>

      {/* =========================
        STEP 1: CATEGORY
    ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Category</label>
          <select
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            value={level1?.interest_id || ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const selected = tree.find((i) => i.interest_id === id);

              setLevel1(selected);
              setLevel2(null);
              setLevel3(null);
            }}
          >
            <option value="">Choose a category</option>
            {tree.map((item) => (
              <option key={item.interest_id} value={item.interest_id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* =========================
        STEP 2: SUBCATEGORY
    ========================= */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Subcategory
          </label>
          <select
            disabled={!level1}
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            value={level2?.interest_id || ""}
            onChange={(e) => {
              const id = Number(e.target.value);

              const selected = (level1?.children || []).find(
                (i) => i.interest_id === id,
              );

              setLevel2(selected);
              setLevel3(null);
            }}
          >
            <option value="">
              {level1 ? "Choose a subcategory" : "Select category first"}
            </option>
            {level1?.children?.map((item) => (
              <option key={item.interest_id} value={item.interest_id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* =========================
        STEP 3: SPECIFIC INTEREST
    ========================= */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Specific Interest (Sub-Sub Category)
          </label>
          <select
            disabled={!level2}
            className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[13px] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            value={level3?.interest_id || ""}
            onChange={(e) => {
              const id = Number(e.target.value);

              const selected = (level2?.children || []).find(
                (i) => i.interest_id === id,
              );

              setLevel3(selected);
            }}
          >
            <option value="">
              {level2
                ? "Choose a specific interest"
                : "Select subcategory first"}
            </option>
            {level2?.children?.map((item) => (
              <option
                key={item.interest_id}
                value={item.interest_id}
                disabled={interests.some(
                  (i) => i.interest_id === item.interest_id,
                )}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* ADD BUTTON */}
      <button
        type="button"
        disabled={!level3}
        onClick={handleAdd}
        className={`w-full py-2 rounded-md text-sm font-medium transition ${
          level3
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Add Interest
      </button>

      {/* ERROR */}
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      {/* SELECTED TAGS */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        {interests.map((item) => (
          <div
            key={item.interest_id}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium"
          >
            {item.name}
            <button
              onClick={() => handleRemove(item.interest_id)}
              className="ml-1 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestsSection;
