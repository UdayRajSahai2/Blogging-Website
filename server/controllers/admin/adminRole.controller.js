//server\controllers\admin\adminRole.controller.js
import * as adminRoleService from "../../services/admin/adminRole.service.js";

export const getRoleRequests = async (req, res, next) => {
  try {
    const data = await adminRoleService.getRoleRequests();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const approveRoleRequest = async (req, res, next) => {
  try {
    await adminRoleService.approveRoleRequest(req.params.userRoleId);

    res.json({
      success: true,
      message: "Role request approved successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const rejectRoleRequest = async (req, res, next) => {
  try {
    await adminRoleService.rejectRoleRequest(req.params.userRoleId);

    res.json({
      success: true,
      message: "Role request rejected successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const revokeRoleRequest = async (req, res, next) => {
  try {
    await adminRoleService.revokeRoleRequest(req.params.userRoleId);

    res.json({
      success: true,
      message: "Role revoked successfully",
    });
  } catch (err) {
    next(err);
  }
};
