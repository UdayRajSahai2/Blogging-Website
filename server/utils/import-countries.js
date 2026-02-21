import { Country } from "../models/associations.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importCountries = async () => {
  try {
    const countryDataPath = path.join(__dirname, "../data/country_codes.json");
    const countryData = JSON.parse(fs.readFileSync(countryDataPath, "utf8"));
    if (!Array.isArray(countryData)) {
      throw new Error("Invalid country_codes.json format");
    }
    for (const country of countryData) {
      // Use 'numeric' as code, 'country' as name, 'alpha-3_code' as abbr
      if (!country.numeric || !country.country || !country["alpha-3_code"])
        continue;
      await Country.findOrCreate({
        where: { country_code: country.numeric },
        defaults: {
          country_code: country.numeric,
          country_name: country.country,
          country_abbr: country["alpha-3_code"],
        },
      });
    }
    console.log("✅ Countries imported successfully!");
  } catch (error) {
    console.error("❌ Error importing countries:", error);
  }
};

export default importCountries;
