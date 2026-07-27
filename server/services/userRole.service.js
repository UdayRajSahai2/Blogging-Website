// server/services/userRole.service.js

import Role from "../models/roles/Role.js";
import UserRole from "../models/roles/UserRole.js";
import sequelize from "../config/db.config.js";

/**
 * User requests a new business role.
 */
export const requestRole = async (userId, roleName) => {
  const transaction = await sequelize.transaction();

  try {
    const normalizedRole = roleName?.trim().toLowerCase();

    const role = await Role.findOne({
      where: { name: normalizedRole, is_active: true },
      transaction,
    });

    if (!role) throw new Error("Invalid role selected");

    let userRole = await UserRole.findOne({
      where: {
        user_id: userId,
        role_id: role.role_id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // FIRST TIME REQUEST
    if (!userRole) {
      const created = await UserRole.create(
        {
          user_id: userId,
          role_id: role.role_id,
          status: "pending",
          requested_at: new Date(),
          action_source: "user",
        },
        { transaction },
      );

      await transaction.commit();
      return created;
    }

    // BLOCK STATES
    if (userRole.status === "pending") {
      throw new Error("Already pending");
    }

    if (userRole.status === "approved") {
      throw new Error("Already assigned");
    }

    // RE-REQUEST FLOW
    if (["rejected", "revoked"].includes(userRole.status)) {
      await userRole.update(
        {
          status: "pending",
          requested_at: new Date(),
          approved_at: null,
          rejected_at: null,
          action_source: "user",
        },
        { transaction },
      );

      await transaction.commit();
      return userRole;
    }

    await transaction.commit();
    return userRole;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Get all roles of logged-in user.
 */
export const getMyRoles = async (userId) => {
  const userRoles = await UserRole.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name", "description"],
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  return userRoles.map((item) => ({
    userRoleId: item.user_role_id,
    roleId: item.role_id,
    name: item.role?.name,
    description: item.role?.description,
    status: item.status,
    isPrimary: item.is_primary,
    requestedAt: item.requested_at,
    approvedAt: item.approved_at,
    rejectedAt: item.rejected_at,
    actionSource: item.action_source,
  }));
};

/**
 * Get all active roles and whether the user already has/requested them.
 */
export const getAvailableRoles = async (userId) => {
  const roles = await Role.findAll({
    where: { is_active: true },
    attributes: ["role_id", "name", "description"],
    order: [["name", "ASC"]],
  });

  const userRoles = await UserRole.findAll({
    where: { user_id: userId },
    attributes: [
      "user_role_id",
      "role_id",
      "status",
      "is_primary",
      "approved_at",
      "rejected_at",
      "action_source",
    ],
  });

  const roleMap = new Map(userRoles.map((r) => [r.role_id, r]));

  return roles.map((role) => {
    const userRole = roleMap.get(role.role_id);

    return {
      role_id: role.role_id,
      name: role.name,
      description: role.description,
      status: userRole?.status || null,
      userRoleId: userRole?.user_role_id || null,
      isPrimary: userRole?.is_primary || false,
      actionSource: userRole?.action_source || null,
      canRequest:
        !userRole || ["rejected", "revoked"].includes(userRole?.status),
    };
  });
};

/**
 * Change primary role (ONLY approved roles allowed)
 */
export const setPrimaryRole = async (userId, roleName) => {
  const transaction = await sequelize.transaction();

  try {
    const normalizedRole = roleName.trim().toLowerCase();

    const role = await Role.findOne({
      where: {
        name: normalizedRole,
        is_active: true,
      },
      transaction,
    });

    if (!role) throw new Error("Role not found");

    const userRole = await UserRole.findOne({
      where: {
        user_id: userId,
        role_id: role.role_id,
        status: "approved",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!userRole) throw new Error("Role is not approved");

    await UserRole.update(
      { is_primary: false },
      {
        where: { user_id: userId },
        transaction,
      },
    );

    await userRole.update({ is_primary: true }, { transaction });

    await transaction.commit();
    return userRole;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Withdraw a pending role request.
 */
export const withdrawRoleRequest = async (userId, userRoleId) => {
  const transaction = await sequelize.transaction();

  try {
    const request = await UserRole.findOne({
      where: {
        user_role_id: userRoleId,
        user_id: userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!request) {
      throw new Error("Role request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be withdrawn");
    }

    await request.update(
      {
        status: "revoked",
        action_source: "user",
        rejected_at: new Date(),
      },
      { transaction },
    );

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
