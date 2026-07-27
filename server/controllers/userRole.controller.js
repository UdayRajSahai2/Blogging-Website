//server\controllers\userRole.controller.js
import * as userRoleService from "../services/userRole.service.js";

export const requestRole = async (req, res, next) => {
  try {
    const result = await userRoleService.requestRole(
      req.user.id,
      req.body.role,
    );

    res.status(201).json({
      success: true,
      message: "Role request submitted successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRoles = async (req, res, next) => {
  try {
    const roles = await userRoleService.getMyRoles(req.user.id);

    res.json({
      success: true,
      data: roles,
    });
  } catch (err) {
    next(err);
  }
};

export const setPrimaryRole = async (req, res, next) => {
  try {
    await userRoleService.setPrimaryRole(req.user.id, req.body.role);

    res.json({
      success: true,
      message: "Primary role updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const getAvailableRoles = async (req, res, next) => {
  try {
    const data = await userRoleService.getAvailableRoles(req.user.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
export const withdrawRoleRequest = async (req, res, next) => {
  try {
    await userRoleService.withdrawRoleRequest(
      req.user.id,
      req.params.userRoleId,
    );

    res.json({
      success: true,
      message: "Role request withdrawn successfully",
    });
  } catch (err) {
    next(err);
  }
};
