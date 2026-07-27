// server/services/admin/adminRole.service.js

import User from "../../models/user/User.js";
import Role from "../../models/roles/Role.js";
import UserRole from "../../models/roles/UserRole.js";

const mapUserRole = (item) => ({
  userRoleId: item.user_role_id,
  userId: item.user_id,
  roleId: item.role_id,

  userName:
    `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() ||
    item.user?.username,

  email: item.user?.email,
  role: item.role?.name,

  status: item.status,
  isPrimary: item.is_primary,

  requestedAt: item.requested_at,
  approvedAt: item.approved_at,
  rejectedAt: item.rejected_at,
  actionSource: item.action_source,
});

export const allowedTransitions = {
  pending: ["approved", "rejected"],
  approved: ["revoked"],
  rejected: ["pending"],
  revoked: ["pending"],
};

export const validateTransition = (current, next) => {
  if (!allowedTransitions[current]?.includes(next)) {
    throw new Error(`Invalid transition: ${current} → ${next}`);
  }
};
/**
 * Get all pending role requests.
 */
export const getAllUserRoles = async () => {
  const requests = await UserRole.findAll({
    where: {}, // or all
    attributes: [
      "user_role_id",
      "user_id",
      "role_id",
      "status",
      "is_primary",
      "requested_at",
      "approved_at",
      "rejected_at",
      "action_source",
    ],

    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "username", "email", "first_name", "last_name"],
      },
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
      },
    ],
  });

  return requests.map(mapUserRole);
};
export const getRoleRequests = async () => {
  const requests = await UserRole.findAll({
    where: {}, // or all
    attributes: [
      "user_role_id",
      "user_id",
      "role_id",
      "status",
      "is_primary",
      "requested_at",
      "approved_at",
      "rejected_at",
      "action_source",
    ],

    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "username", "email", "first_name", "last_name"],
      },
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
      },
    ],
  });

  return requests.map(mapUserRole);
};
/**
 * Approve a role request.
 */
const sequelize = UserRole.sequelize;

export const approveRoleRequest = async (userRoleId) => {
  const transaction = await sequelize.transaction();

  try {
    const request = await UserRole.findByPk(userRoleId, {
      transaction,
      attributes: [
        "user_role_id",
        "user_id",
        "role_id",
        "status",
        "is_primary",
        "requested_at",
        "approved_at",
        "rejected_at",
        "action_source",
      ],
    });

    if (!request) throw new Error("Role request not found");

    validateTransition(request.status, "approved");

    await request.update(
      {
        status: "approved",
        action_source: "admin",
        approved_at: new Date(),
      },
      { transaction },
    );

    await transaction.commit();
    return request;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Reject a role request.
 */
export const rejectRoleRequest = async (userRoleId) => {
  const transaction = await sequelize.transaction();

  try {
    const request = await UserRole.findByPk(userRoleId, {
      transaction,
      attributes: [
        "user_role_id",
        "user_id",
        "role_id",
        "status",
        "is_primary",
        "requested_at",
        "approved_at",
        "rejected_at",
        "action_source",
      ],
    });

    if (!request) throw new Error("Role request not found");

    validateTransition(request.status, "rejected");

    await request.update(
      {
        status: "rejected",
        rejected_at: new Date(),
        approved_at: null,
        is_primary: false,
      },
      { transaction },
    );

    await transaction.commit();
    return request;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
export const revokeRoleRequest = async (userRoleId) => {
  const transaction = await sequelize.transaction();

  try {
    const request = await UserRole.findByPk(userRoleId, {
      transaction,
      attributes: [
        "user_role_id",
        "user_id",
        "role_id",
        "status",
        "is_primary",
        "requested_at",
        "approved_at",
        "rejected_at",
        "action_source",
      ],
    });

    if (!request) {
      throw new Error("Role not found");
    }

    validateTransition(request.status, "revoked");

    // if primary role → remove it
    if (request.is_primary) {
      await UserRole.update(
        { is_primary: false },
        { where: { user_id: request.user_id }, transaction },
      );
    }

    await request.update(
      {
        status: "revoked",
        is_primary: false,
        approved_at: null,
        action_source: "admin", // optional but recommended
      },
      { transaction },
    );

    await transaction.commit();
    return request;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
