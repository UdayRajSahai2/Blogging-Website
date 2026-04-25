// backend/src/controllers/role.controller.js

import Role from "../models/roles/Role.js";
import UserRole from "../models/roles/UserRole.js";

export const requestRoles = async (req, res) => {
  const userId = req.user.id;
  const { roles } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ error: "Roles must be a non-empty array" });
  }

  const transaction = await sequelize.transaction();

  try {
    let success = 0;
    let skipped = 0;
    let invalid = 0;

    for (const item of roles) {
      let { role, isPrimary = false } = item;

      if (!role) {
        invalid++;
        continue;
      }

      role = role.toLowerCase();

      const roleRecord = await Role.findOne({
        where: { role_name: role },
        transaction,
      });

      if (!roleRecord) {
        invalid++;
        continue;
      }

      const exists = await UserRole.findOne({
        where: {
          user_id: userId,
          role_id: roleRecord.role_id,
        },
        transaction,
      });

      if (exists) {
        skipped++;
        continue;
      }

      if (isPrimary) {
        await UserRole.update(
          { is_primary: false },
          { where: { user_id: userId }, transaction },
        );
      }

      await UserRole.create(
        {
          user_id: userId,
          role_id: roleRecord.role_id,
          status: "pending",
          is_primary: isPrimary,
        },
        { transaction },
      );

      success++;
    }

    await transaction.commit();

    return res.json({
      success: true,
      added: success,
      skipped,
      invalid,
    });
  } catch (err) {
    await transaction.rollback();
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
        user_id: req.user.id,
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
