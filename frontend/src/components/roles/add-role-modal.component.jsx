import { useState } from "react";
import toast from "react-hot-toast";
import { requestRoles } from "../../api/role.api";
import Modal from "../../common/modal";

const rolesList = [
  "teacher",
  "doctor",
  "service_provider",
  "blogger",
  "entrepreneur",
  "activist",
  "researcher",
  "event_manager",
];

const AddRoleModal = ({ isOpen, onClose, currentRoles = [] }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleAddRoles = async () => {
    if (!selectedRoles.length) {
      return toast.error("Select at least one role");
    }

    try {
      setLoading(true);

      const newRoles = selectedRoles.filter((r) => !currentRoles.includes(r));

      if (!newRoles.length) {
        return toast.error("All selected roles already exist");
      }

      const res = await requestRoles(
        newRoles.map((role) => ({
          role,
          isPrimary: false,
        })),
      );

      if (res.added) {
        toast.success(`${res.added} role(s) requested 🚀`);
      }

      if (res.skipped) {
        toast(`${res.skipped} already requested/assigned`, {
          icon: "⚠️",
        });
      }

      setSelectedRoles([]);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to request role");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={!loading ? onClose : undefined}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-[360px] max-h-[80vh] rounded-2xl shadow-xl p-6 flex flex-col">
          {/* HEADER */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Add Profiles</h2>
            <p className="text-sm text-gray-500">
              Select roles you want to request
            </p>
          </div>

          {/* SELECTED COUNT */}
          {selectedRoles.length > 0 && (
            <div className="mb-3 text-xs text-gray-600">
              {selectedRoles.length} selected
            </div>
          )}

          {/* ROLE LIST */}
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
            {rolesList.map((role) => {
              const isDisabled = currentRoles.includes(role);
              const isSelected = selectedRoles.includes(role);

              return (
                <button
                  key={role}
                  disabled={isDisabled}
                  onClick={() => toggleRole(role)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition
                    ${isDisabled && "bg-gray-100 text-gray-400 cursor-not-allowed"}
                    ${isSelected && !isDisabled && "bg-black text-white border-black"}
                    ${!isSelected && !isDisabled && "hover:bg-gray-100"}
                  `}
                >
                  <span>{role.replace("_", " ")}</span>

                  {isDisabled && <span className="text-xs">✓</span>}

                  {isSelected && !isDisabled && <span>✔</span>}
                </button>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={handleAddRoles}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-black text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Request Profiles"}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddRoleModal;
