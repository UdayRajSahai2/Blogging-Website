// backend/src/controllers/admin/admin.role.controller.js

import Role from "../../models/roles/Role.js";
import UserRole from "../../models/roles/UserRole.js";
import User from "../../models/user/User.js";
export const createRole = async (req, res) => {
  try {
    const { role_name } = req.body;

    if (!role_name) {
      return res.status(400).json({ error: "Role name required" });
    }

    const existing = await Role.findOne({
      where: { role_name: role_name.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({ error: "Role already exists" });
    }

    const role = await Role.create({
      role_name: role_name.toLowerCase(),
    });

    res.json({ message: "Role created", role });
  } catch (err) {
    res.status(500).json({ error: "Failed to create role" });
  }
};
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [["role_name", "ASC"]],
    });

    res.json({ roles });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};
export const updateRole = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { role_name } = req.body;

    const role = await Role.findByPk(role_id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await role.update({
      role_name: role_name.toLowerCase(),
    });

    res.json({ message: "Role updated", role });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
};
export const deleteRole = async (req, res) => {
  try {
    const { role_id } = req.params;

    const role = await Role.findByPk(role_id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // PUT IT HERE (BEFORE DELETE)
    const usage = await UserRole.findOne({ where: { role_id } });

    if (usage) {
      return res.status(400).json({
        error: "Role is assigned to users",
      });
    }

    await role.destroy();

    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete role" });
  }
};
export const getPendingRoleCount = async (req, res) => {
  try {
    const count = await UserRole.count({
      where: { status: "pending" },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
};
export const getPendingRoleRequests = async (req, res) => {
  try {
    const requests = await UserRole.findAll({
      where: { status: "pending" },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "fullname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};
export const approveRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const record = await UserRole.findOne({
      where: { user_id, role_id },
    });

    if (!record) {
      return res.status(404).json({ error: "Request not found" });
    }

    await record.update({ status: "approved" });

    res.json({ message: "Role approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  }
};
export const rejectRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const record = await UserRole.findOne({
      where: { user_id, role_id },
    });

    if (!record) {
      return res.status(404).json({ error: "Request not found" });
    }

    await record.update({ status: "rejected" });

    res.json({ message: "Role rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rejection failed" });
  }
};
//  ADMIN: Assign role to ANY user
export const assignRoleToUserByAdmin = async (req, res) => {
  const { userId, role, is_primary = false } = req.body;

  try {
    if (!["admin", "super_admin"].includes(req.systemRole)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        error: "Valid role is required",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const normalizedRole = role.toLowerCase();

    const roleRecord = await Role.findOne({
      where: { role_name: normalizedRole },
    });

    if (!roleRecord) {
      return res.status(400).json({
        error: "Role does not exist",
      });
    }

    const existing = await UserRole.findOne({
      where: {
        user_id: userId,
        role_id: roleRecord.role_id,
      },
    });

    //  HANDLE EXISTING ROLE
    if (existing) {
      if (existing.status === "pending") {
        await existing.update({
          status: "approved",
          is_primary,
        });

        return res.json({
          message: "Role approved successfully",
        });
      }

      return res.status(400).json({
        error: "User already has this role",
      });
    }

    if (is_primary) {
      await UserRole.update(
        { is_primary: false },
        { where: { user_id: userId } },
      );
    }

    await UserRole.create({
      user_id: userId,
      role_id: roleRecord.role_id,
      is_primary,
      status: "approved", //  IMPORTANT
    });

    return res.json({
      message: "Role assigned successfully",
      data: {
        user_id: userId,
        role: normalizedRole,
        is_primary,
      },
    });
  } catch (err) {
    console.error("ADMIN ASSIGN ROLE ERROR:", err);
    return res.status(500).json({
      error: "Failed to assign role",
    });
  }
};
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const roleRecord = await Role.findOne({
      where: { role_name: role.toLowerCase() },
    });

    if (!roleRecord) {
      return res.status(404).json({ error: "Role not found" });
    }

    const users = await UserRole.findAll({
      where: {
        role_id: roleRecord.role_id,
        status: "approved", // IMPORTANT
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "fullname", "email"],
        },
      ],
    });

    res.json({
      users: users.map((u) => u.User),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
export const getApprovedUsers = async (req, res) => {
  const users = await UserRole.findAll({
    where: { status: "approved" },
    include: [
      { model: User, as: "user" },
      { model: Role, as: "role" },
    ],
  });

  res.json({
    users: users.map((u) => ({
      user_id: u.user.user_id,
      fullname: u.user.fullname,
      username: u.user.username,
      role: u.role.role_name,
    })),
  });
};
export const removeUserRole = async (req, res) => {
  try {
    const { user_id, role } = req.body;

    const roleRecord = await Role.findOne({
      where: { role_name: role },
    });

    await UserRole.destroy({
      where: {
        user_id,
        role_id: roleRecord.role_id,
      },
    });

    res.json({ message: "Role removed from user" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove role" });
  }
};
export const updateUserRole = async (req, res) => {
  try {
    const { user_id, oldRole, newRole } = req.body;

    if (!user_id || !oldRole || !newRole) {
      return res.status(400).json({
        error: "user_id, oldRole and newRole are required",
      });
    }

    //  Find roles
    const oldRoleRecord = await Role.findOne({
      where: { role_name: oldRole.toLowerCase() },
    });

    const newRoleRecord = await Role.findOne({
      where: { role_name: newRole.toLowerCase() },
    });

    if (!oldRoleRecord || !newRoleRecord) {
      return res.status(404).json({
        error: "Role not found",
      });
    }

    //  Update role
    const updated = await UserRole.update(
      { role_id: newRoleRecord.role_id },
      {
        where: {
          user_id,
          role_id: oldRoleRecord.role_id,
        },
      },
    );

    if (!updated[0]) {
      return res.status(404).json({
        error: "User role not found",
      });
    }

    return res.json({
      message: "User role updated successfully",
    });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    return res.status(500).json({
      error: "Failed to update user role",
    });
  }
};
export const getUserDetails = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      attributes: ["user_id", "fullname", "username", "email"],
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roles = user.userRoles.map((r) => r.role.role_name);

    res.json({
      user: {
        user_id: user.user_id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        roles,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
