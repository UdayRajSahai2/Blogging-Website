import Page from "../models/Page.js";

export const getPageByPathService = async (path) => {
  return await Page.findOne({
    where: { path },

    include: [
      {
        model: Page,
        as: "children",
        attributes: ["id", "title", "path"],
      },
    ],
  });
};
