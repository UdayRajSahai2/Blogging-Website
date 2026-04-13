import { useEffect } from "react";

const RoleSwitcher = ({
  roles = [],
  activeRole,
  setActiveRole,
  onRoleChange,
}) => {
  useEffect(() => {
    if (roles.length && !roles.includes(activeRole)) {
      setActiveRole(roles[0]);
    }
  }, [roles, activeRole, setActiveRole]);

  const handleChange = (e) => {
    const newRole = e.target.value;

    setActiveRole(newRole);

    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };

  if (!roles.length) return null;

  return (
    <div className="flex items-center gap-3">
      <select
        value={activeRole || ""}
        onChange={handleChange}
        className="border px-3 py-2 rounded-lg text-sm bg-white"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSwitcher;
