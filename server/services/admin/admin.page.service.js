// services/admin/admin.page.service.js

import Page from "../../models/Page.js";

/* GET ALL */
export const getAllPagesService = async () => {
  return await Page.findAll({
    order: [["id", "ASC"]],
  });
};

/* GET BY ID */
export const getPageByIdService = async (id) => {
  return await Page.findByPk(id);
};

/* GET BY PATH */
export const getPageByPathService = async (path) => {
  return await Page.findOne({
    where: {
      path,
      status: "published",
    },
  });
};

/* CREATE */
export const createPageService = async (data) => {
  return await Page.create({
    title: data.title,

    slug: data.slug,

    path: data.path,

    parent_id: data.parent_id || null,

    sections: data.sections || [],

    status: data.status || "draft",

    meta_title: data.meta_title || null,

    meta_description: data.meta_description || null,
  });
};

/* UPDATE */
export const updatePageService = async (id, data) => {
  const page = await Page.findByPk(id);

  if (!page) {
    throw new Error("Page not found");
  }

  await page.update({
    title: data.title,

    slug: data.slug,

    path: data.path,

    parent_id: data.parent_id ?? page.parent_id,

    sections: data.sections || [],

    status: data.status || page.status,

    meta_title: data.meta_title || null,

    meta_description: data.meta_description || null,
  });

  return page;
};
