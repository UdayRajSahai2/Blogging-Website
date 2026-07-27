import {
  clearProfessionData,
  importProfessionData,
  getProfessionStats,
} from "./import-profession-data.js";
import sequelize from "../config/db.config.js";

const MODE = process.env.MODE || "safe"; // "safe" | "reset"

const runImport = async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log(" Profession Import Script Started...");
    console.log(` Mode: ${MODE}`);

    // DB connection check
    await sequelize.authenticate();
    console.log(" Database connected");

    // BEFORE STATS
    const beforeStats = await getProfessionStats(transaction);
    console.log(" Before:", beforeStats);

    // OPTIONAL RESET
    if (MODE === "reset") {
      console.log(" Reset mode: clearing existing data...");
      await clearProfessionData(transaction);
    }

    // IMPORT
    console.log(" Importing profession hierarchy...");
    const result = await importProfessionData(transaction);
    console.log(" Import result:", result);

    // AFTER STATS
    const afterStats = await getProfessionStats(transaction);
    console.log(" After:", afterStats);

    // COMMIT
    await transaction.commit();

    console.log("Import completed successfully!");
    console.log(` Records: ${beforeStats.total} → ${afterStats.total}`);
  } catch (error) {
    await transaction.rollback();

    console.error(" Import failed:", {
      message: error.message,
      stack: error.stack,
    });
  } finally {
    await sequelize.close();
  }
};

runImport();
