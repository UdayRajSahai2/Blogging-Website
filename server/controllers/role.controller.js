// backend/src/controllers/role.controller.js

import Role from "../models/roles/Role.js";
import UserRole from "../models/roles/UserRole.js";

export const requestRoles = async (req, res) => {
  const userId = req.userId;
  const { roles } = req.body;

  try {
    if (!roles || !roles.length) {
      return res.status(400).json({ error: "Roles are required" });
    }

    let success = 0;
    let skipped = 0;

    for (const item of roles) {
      let { role, isPrimary = false } = item;

      if (!role) continue;

      role = role.toLowerCase();

      const roleRecord = await Role.findOne({
        where: { role_name: role },
      });

      if (!roleRecord) continue;

      const exists = await UserRole.findOne({
        where: {
          user_id: userId,
          role_id: roleRecord.role_id,
        },
      });

      if (exists) {
        skipped++;
        continue;
      }

      // ✅ Only one primary role
      if (isPrimary) {
        await UserRole.update(
          { is_primary: false },
          { where: { user_id: userId } },
        );
      }

      await UserRole.create({
        user_id: userId,
        role_id: roleRecord.role_id,
        status: "pending",
        is_primary: isPrimary,
      });

      success++;
    }

    return res.json({
      success: true,
      added: success,
      skipped,
    });
  } catch (err) {
    console.error("REQUEST ROLES ERROR:", err);
    return res.status(500).json({
      error: "Failed to request roles",
    });
  }
};

export const getMyRoles = async (req, res) => {
  try {
    const roles = await UserRole.findAll({
      where: {
        user_id: req.userId,
        status: "approved",
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_name"],
        },
      ],
    });

    const roleNames = roles.map((r) => r?.role?.role_name).filter(Boolean);

    return res.json({
      success: true,
      roles: roleNames,
    });
  } catch (err) {
    console.error("GET ROLES ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch roles",
    });
  }
};
