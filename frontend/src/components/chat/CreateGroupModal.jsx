import { useState } from "react";
import { createConversationAPI } from "../../api/chat.api";
import UserPicker from "./UserPicker";

const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      if (selectedUsers.length < 2) {
        alert("Select at least 2 users");
        return;
      }

      if (!groupName.trim()) {
        alert("Group name required");
        return;
      }

      setLoading(true);

      const userIds = selectedUsers.map((u) => u.user_id);

      const res = await createConversationAPI({
        isGroup: true,
        groupName: groupName.trim(),
        userIds,
      });

      onSuccess(res.data.data);

      // reset state
      setGroupName("");
      setSelectedUsers([]);

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose} // close on outside click
    >
      <div
        className="bg-white p-4 rounded w-[350px] shadow-lg"
        onClick={(e) => e.stopPropagation()} // prevent closing inside
      >
        <h3 className="font-semibold mb-3 text-lg">Create Group</h3>

        {/* 📝 GROUP NAME */}
        <input
          type="text"
          placeholder="Group Name"
          className="w-full border p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-blue-400"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* 👥 USER PICKER */}
        <UserPicker
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className={`px-3 py-1 rounded text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
