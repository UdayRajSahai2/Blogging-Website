import sequelize from "../config/db.config.js";
import Page from "../models/Page.js";
import menuData from "../data/menuData.js"; // adjust path if needed
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
    const path = parentPath ? `${parentPath}/${slug}` : `/${slug}`;

    let page = await Page.findOne({ where: { path } });

    if (!page) {
      page = await Page.create({
        title: item.name,
        slug,
        path,
        parent_id: parentId,
      });

      console.log("Inserted:", path);
    }

    if (item.children) {
      await insertMenu(item.children, page.id, path);
    }
  }
};

// run
const run = async () => {
  try {
    await insertMenu(menuData);

    console.log(" Seeding complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
