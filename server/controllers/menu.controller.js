import { getMenuService } from "../services/menu.service.js";

export const getMenuController = async (req, res) => {
  try {
    const menu = await getMenuService();

    return res.status(200).json(menu);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch menu",
    });
  }
};
