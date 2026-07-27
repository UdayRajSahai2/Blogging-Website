import Country from "../models/locations/Country.js";
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

    // Use 'numeric' as code, 'country' as name, 'alpha-3_code' as abbr
    for (const country of countryData) {
      const numeric = country.numeric;
      const name = country.country;
      const alpha3 = country["alpha-3_code"];
      const alpha2 = country["alpha-2_code"];
      if (!numeric || !name || !alpha3 || !alpha2) {
        console.log("Skipping invalid:", country);
        continue;
      }

      console.log("Importing:", numeric, name, alpha3, alpha2);

      await Country.findOrCreate({
        where: { country_code: numeric },
        defaults: {
          country_code: numeric, // 356
          country_name: name, // India
          country_abbr: alpha3, // IND
          country_alpha2: alpha2, // IN
        },
      });
    }
    console.log(" Countries imported successfully!");
  } catch (error) {
    console.error("Error importing countries:", error);
  }
};

export default importCountries;
