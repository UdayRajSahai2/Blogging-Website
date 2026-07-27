// controllers/admin/admin.page.controller.js

import {
  createPageService,
  getAllPagesService,
  getPageByIdService,
  getPageByPathService,
  updatePageService,
} from "../../services/admin/admin.page.service.js";

/* GET ALL */
export const getAllPagesController = async (req, res) => {
  try {
    const pages = await getAllPagesService();

    return res.status(200).json(pages);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch pages",
    });
  }
};

/* GET BY ID */
export const getPageByIdController = async (req, res) => {
  try {
    const page = await getPageByIdService(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json(page);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch page",
    });
  }
};

/* GET BY PATH */
export const getPageByPathController = async (req, res) => {
  try {
    const path = `/${req.params.path || ""}`;

    const page = await getPageByPathService(path);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    return res.status(200).json(page);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch page",
    });
  }
};

/* CREATE */
export const createPageController = async (req, res) => {
  try {
    const page = await createPageService(req.body);

    return res.status(201).json({
      message: "Page created successfully",
      data: page,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create page",
    });
  }
};

/* UPDATE */
export const updatePageController = async (req, res) => {
  try {
    const page = await updatePageService(req.params.id, req.body);

    return res.status(200).json({
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update page",
    });
  }
};
