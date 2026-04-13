import { useEffect, useState } from "react";
import { searchFriendsAPI } from "../../api/connection.api";

const UserPicker = ({ selectedUsers, setSelectedUsers }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const res = await searchFriendsAPI(query);

        // ✅ safe API handling
        const users = res.data?.data || res.data || [];

        // ❗ remove self
        const filtered = users.filter(
          (u) => u.user_id !== currentUser?.user_id,
        );

        setResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const addUser = (user) => {
    if (selectedUsers.some((u) => u.user_id === user.user_id)) return;
    setSelectedUsers([...selectedUsers, user]);
  };

  const removeUser = (id) => {
    setSelectedUsers(selectedUsers.filter((u) => u.user_id !== id));
  };

  return (
    <div>
      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search friends..."
        className="w-full border p-2 mb-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* 🔎 RESULTS */}
      <div className="max-h-40 overflow-y-auto border rounded mb-2">
        {loading && <p className="p-2 text-sm text-gray-500">Searching...</p>}

        {!loading &&
          results.map((user) => {
            const isSelected = selectedUsers.some(
              (u) => u.user_id === user.user_id,
            );

            return (
              <div
                key={user.user_id}
                onClick={() => addUser(user)}
                className={`flex items-center gap-2 p-2 cursor-pointer ${
                  isSelected ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                <img
                  src={user.profile_img || "/default.png"}
                  onError={(e) => (e.target.src = "/default.png")}
                  className="w-6 h-6 rounded-full object-cover"
                />

                <span className="text-sm">{user.fullname}</span>

                {isSelected && (
                  <span className="ml-auto text-xs text-blue-600">✓</span>
                )}
              </div>
            );
          })}

        {!loading && results.length === 0 && query && (
          <p className="p-2 text-sm text-gray-500">No results</p>
        )}
      </div>

      {/* ✅ SELECTED USERS */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full"
          >
            <span className="text-sm">{user.fullname}</span>

            <button
              onClick={() => removeUser(user.user_id)}
              className="text-red-500 text-xs hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPicker;
