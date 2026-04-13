console.log("Starting import-all-location-data.js");
import importCountries from "./import-countries.js";
import importLocationData from "./import-location-data.js";
import { setupAssociations } from "../models/associations.js";
console.log("Imports completed, about to define runAllImports...");

const runAllImports = async () => {
  console.log("runAllImports function is defined");
  try {
    console.log("🚀 Starting complete location data import process...");
    // Setup associations first
    console.log("🔗 Setting up database associations...");
    // If you need to call setupAssociations, do it here
    // setupAssociations();
    console.log("Calling importCountries...");
    await importCountries();
    console.log("Countries import done. Calling importLocationData...");
    await importLocationData();
    console.log("Location data import done.");
    console.log(
      "\n🎉 Complete location data import process finished successfully!",
    );
    console.log("✅ All location tables are now populated and ready to use.");
  } catch (error) {
    console.error("❌ Error in complete location data import process:", error);
    throw error;
  }
};

console.log("Checking if script is run directly...");
if (
  process.argv[1] &&
  process.argv[1].includes("import-all-location-data.js")
) {
  console.log("Detected direct script execution. Running runAllImports...");
  runAllImports()
    .then(() => {
      console.log(
        "✅ Complete location data import script completed successfully",
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Complete location data import script failed:", error);
      process.exit(1);
    });
}

export default runAllImports;
