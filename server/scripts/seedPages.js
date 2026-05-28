// server/scripts/seedPages.js

import sequelize from "../config/db.config.js";
import Page from "../models/Page.js";
import menuData from "../data/menuData.js";

// WHEN TO RUN THIS
// first time setup
// when menu changes
// when resetting DB

// slugify
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// recursive insert
const insertMenu = async (items, parentId = null, parentPath = "") => {
  for (const item of items) {
    const slug = slugify(item.name);

    // HOME FIX
    let path;

    if (slug === "home") {
      path = "/";
    } else {
      path = parentPath ? `${parentPath}/${slug}` : `/${slug}`;
    }

    let page = await Page.findOne({
      where: {
        slug,
        parent_id: parentId,
      },
    });

    // CREATE
    if (!page) {
      page = await Page.create({
        title: item.name,

        slug,

        path,

        parent_id: parentId,

        sections: [],

        // HOME PUBLISHED
        status: path === "/" ? "published" : "draft",

        meta_title: item.name,

        meta_description: "",

        show_in_menu: true,

        menu_order: 0,
      });

      console.log(`Inserted: ${path}`);
    }

    // UPDATE EXISTING
    else {
      await page.update({
        title: item.name,

        path,

        parent_id: parentId,

        // keep home always published
        status: path === "/" ? "published" : page.status,
      });

      console.log(`Updated: ${path}`);
    }

    // CHILDREN
    if (
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      await insertMenu(item.children, page.id, path);
    }
  }
};

// run
const run = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected");

    await insertMenu(menuData);

    console.log("Seeding complete");

    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);

    process.exit(1);
  }
};

run();
