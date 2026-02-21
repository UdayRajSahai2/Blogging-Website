import {
  clearProfessionData,
  importProfessionData,
  getProfessionStats,
} from "./utils/import-profession-data.js";
import sequelize from "./config/db.config.js";

const refreshProfessionData = async () => {
  try {
    console.log("🔄 Starting profession data refresh...");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Check current stats
    const beforeStats = await getProfessionStats();
    console.log("📊 Current profession data:", beforeStats);

    // Clear existing data
    console.log("🗑️ Clearing existing profession data...");
    const clearResult = await clearProfessionData();
    console.log("✅ Clear result:", clearResult);

    // Import fresh data from updated JSON
    console.log("📥 Importing fresh data from updated JSON file...");
    const importResult = await importProfessionData();
    console.log("✅ Import result:", importResult);

    // Check final stats
    const afterStats = await getProfessionStats();
    console.log("📊 Final profession data:", afterStats);

    console.log("🎉 Profession data refresh completed successfully!");
    console.log(
      `📈 Data change: ${beforeStats.total} → ${afterStats.total} records`,
    );
    console.log(
      `📊 Breakdown: ${afterStats.domains} domains, ${afterStats.fields} fields, ${afterStats.specialties} specialties`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Refresh failed:", error);
    process.exit(1);
  }
};

refreshProfessionData();
