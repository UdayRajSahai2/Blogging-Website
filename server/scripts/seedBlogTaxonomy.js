// server/scripts/seedBlogTaxonomy.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "../config/db.config.js";
import BlogTaxonomy from "../models/blog/BlogTaxonomy.js";

// FIX __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON FILE PATH
const jsonPath = path.join(__dirname, "../data/blog-taxonomy.json");

const seedBlogTaxonomy = async () => {
  try {
    // DB CONNECTION
    await sequelize.authenticate();

    console.log("✅ Database connected");

    // READ JSON FILE
    const rawData = fs.readFileSync(jsonPath, "utf-8");

    const taxonomyData = JSON.parse(rawData);

    // VALIDATE DATA
    if (!Array.isArray(taxonomyData)) {
      throw new Error("Invalid taxonomy JSON format");
    }

    console.log(`📦 Found ${taxonomyData.length} records`);

    // OPTIONAL: CLEAR OLD DATA
    await BlogTaxonomy.destroy({
      where: {},
      truncate: true,
      force: true,
    });

    console.log("🗑 Old taxonomy data cleared");
    // REMOVE DUPLICATE taxonomy_id
    const uniqueData = Array.from(
      new Map(
        taxonomyData.map((item) => [
          `${item.group_id}-${item.taxonomy_id}`,
          item,
        ]),
      ).values(),
    );

    console.log(`✅ Unique records: ${uniqueData.length}`);

    // BULK INSERT
    await BlogTaxonomy.bulkCreate(uniqueData, {
      validate: true,
    });
    const seen = new Set();

    taxonomyData.forEach((item) => {
      const key = `${item.group_id}-${item.taxonomy_id}`;

      if (seen.has(key)) {
        console.log("DUPLICATE:", key);
      }

      seen.add(key);
    });
    console.log(
      `✅ Successfully seeded ${taxonomyData.length} taxonomy records`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed blog taxonomy");

    console.error(error);

    process.exit(1);
  }
};

seedBlogTaxonomy();
