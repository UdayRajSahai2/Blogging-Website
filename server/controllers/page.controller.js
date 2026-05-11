//server\controllers\page.controller.js
import { getPageByPathService } from "../services/page.service.js";

export const getPageByPath = async (req, res) => {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({ message: "Path is required" });
    }

    const page = await getPageByPathService(path);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    console.error("Page error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
