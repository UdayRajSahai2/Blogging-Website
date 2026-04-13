import { useEffect, useState } from "react";
import AddRoleModal from "../components/roles/add-role-modal.component";
import { getCurrentUser, getPrimaryRole } from "../common/session";
import { getMyRoles } from "../api/role.api";

const Dashboard = () => {
  const user = getCurrentUser();

  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ---------------- FETCH ROLES ---------------- */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getMyRoles();
        setRoles(res || []);
      } catch (err) {
        console.error("Failed to load roles", err);
        setRoles([]);
      }
    };

    fetchRoles();
  }, []);

  /* ---------------- SET ACTIVE ROLE ---------------- */
  useEffect(() => {
    if (!roles.length) return;

    const storedRole = getPrimaryRole();

    if (storedRole && roles.includes(storedRole)) {
      setActiveRole(storedRole);
    } else {
      setActiveRole(roles[0]);
    }
  }, [roles]);

  /* ---------------- HANDLE ROLE CHANGE ---------------- */
  const handleRoleChange = (role) => {
    setActiveRole(role);
    localStorage.setItem("primary_role", role);
  };

  const roleLabel = (role) => role?.replace("_", " ");

  /* ---------------- ROLE ICONS ---------------- */
  const roleIcons = {
    student: "🎓",
    blogger: "✍️",
    doctor: "🩺",
    service_provider: "🛠",
    activist: "✊",
    entrepreneur: "🚀",
    researcher: "🔬",
    event_manager: "📅",
  };

  /* ---------------- ROLE CONTENT ---------------- */
  const renderRoleContent = () => {
    const contentMap = {
      student: {
        title: "Student Dashboard",
        desc: "Track academics, progress, and collaborate.",
        color: "purple",
      },
      blogger: {
        title: "Blogger Dashboard",
        desc: "Write blogs and track engagement.",
        color: "blue",
      },
      doctor: {
        title: "Doctor Dashboard",
        desc: "Manage patients and consultations.",
        color: "green",
      },
      service_provider: {
        title: "Service Provider",
        desc: "Manage bookings and services.",
        color: "amber",
      },
      activist: {
        title: "Activist Dashboard",
        desc: "Create campaigns and mobilize communities.",
        color: "rose",
      },
      entrepreneur: {
        title: "Entrepreneur Dashboard",
        desc: "Manage startups and growth.",
        color: "amber",
      },
      researcher: {
        title: "Researcher Dashboard",
        desc: "Publish and collaborate.",
        color: "blue",
      },
      event_manager: {
        title: "Event Manager",
        desc: "Organize and manage events.",
        color: "purple",
      },
    };

    const roleData = contentMap[activeRole];

    if (!roleData) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          No dashboard available for this role yet.
        </div>
      );
    }

    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-lg text-lg">
            {roleIcons[activeRole]}
          </div>

          <h2 className="text-lg font-semibold">{roleData.title}</h2>
        </div>

        <p className="text-sm text-gray-600">{roleData.desc}</p>
      </div>
    );
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (!roles.length) {
    return (
      <div className="p-10 text-center max-w-md mx-auto">
        {/* 🧩 Icon */}
        <div className="text-4xl mb-4">🛡️</div>

        {/* 🔥 Title */}
        <h3 className="text-lg font-semibold mb-2">No Roles Assigned Yet</h3>

        {/* 💡 Explanation */}
        <p className="text-sm text-gray-500 mb-4">
          You currently don’t have any roles assigned to your account. Roles
          define what features and permissions you can access on the platform.
        </p>

        {/* 📌 Context */}
        <p className="text-xs text-gray-400 mb-6">
          You can request a role based on your activity (e.g. Blogger, Event
          Manager, Service Provider etc.). Admin approval may be required.
        </p>

        {/* 🚀 CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          + Request a Role
        </button>

        {/* 🔐 Disclaimer */}
        <p className="text-[11px] text-gray-400 mt-4">
          Requests are reviewed by administrators. Approval time may vary.
        </p>

        <AddRoleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          currentRoles={roles}
          onRolesUpdate={setRoles}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="bg-white shadow rounded-xl p-5 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Welcome, {user?.fullname || user?.username}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Active Role</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize">
              {roleLabel(activeRole)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          + Add Role
        </button>
      </div>

      {/* ================= ROLE TABS ================= */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`px-4 py-2 rounded-full text-sm capitalize whitespace-nowrap ${
              activeRole === role
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {roleIcons[role]} {roleLabel(role)}
          </button>
        ))}
      </div>

      {/* ================= ALERT ================= */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex justify-between items-center">
        <p className="text-sm text-yellow-800">
          ⚠️ Complete your {roleLabel(activeRole)} profile
        </p>

        <button className="text-xs px-3 py-1 bg-yellow-600 text-white rounded">
          Complete Now
        </button>
      </div>

      {/* ================= ROLE CONTENT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderRoleContent()}
      </div>

      {/* ================= MODAL ================= */}
      <AddRoleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentRoles={roles}
        onRolesUpdate={(updatedRoles) => {
          setRoles(updatedRoles);
          setActiveRole(updatedRoles[updatedRoles.length - 1]);
        }}
      />
    </div>
  );
};

export default Dashboard;
