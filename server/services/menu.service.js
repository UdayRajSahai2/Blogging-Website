import Page from "../models/Page.js";

const buildTree = (pages, parentId = null) => {
  return pages
    .filter((page) => page.parent_id == parentId)

    .map((page) => {
      const children = buildTree(pages, page.id);

      return {
        id: page.id,

        name: page.title,

        path: page.path,

        status: page.status,

        ...(children.length > 0 && {
          children,
        }),
      };
    });
};

export const getMenuService = async () => {
  const pages = await Page.findAll({
    order: [["id", "ASC"]],
  });

  return buildTree(pages);
};
