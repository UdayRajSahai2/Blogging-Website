// server/scripts/import-location-data.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Country from "../models/locations/Country.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";
import Block from "../models/locations/Block.js";
import Village from "../models/locations/Village.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Normalize helper (CRITICAL FIX)
const clean = (v) => (v ? String(v).trim() : null);

const importLocationData = async () => {
  try {
    console.log(" Starting SAFE location import...");

    const filePath = path.join(__dirname, "../data/village-lgd-codes.json");
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const fieldNames = raw.fields.map((f) => f.id);
    const records = raw.records;

    if (!Array.isArray(records)) throw new Error("Invalid JSON records");

    console.log(" Total records:", records.length);

    // -----------------------------
    // STEP 1: MAP RECORDS
    // -----------------------------
    const mapped = records.map((arr) =>
      Object.fromEntries(fieldNames.map((f, i) => [f, arr[i]])),
    );

    // -----------------------------
    // STEP 2: BUILD RAW STRUCTURE
    // -----------------------------
    const countries = new Map();
    const states = new Map();
    const districts = new Map();
    const blocks = new Map();
    const villages = new Map();

    console.log(" Processing hierarchy...");

    for (const r of mapped) {
      const countryCode = clean(r.country_code || "356");
      const stateCode = clean(r.state_code);
      const stateName = clean(r.state_name);
      const districtCode = clean(r.district_code);
      const districtName = clean(r.district_name);
      const blockCode = clean(r.block_code);
      const blockName = clean(r.block_name);
      const subDistrict = clean(r.sub_district_name);
      const villageCode = clean(r.village_code);
      const villageName = clean(r.village_name);

      if (!stateCode || !districtCode || !blockCode || !villageCode) continue;

      // Country
      countries.set(countryCode, {
        country_code: countryCode,
        country_name: countryCode,
        is_active: true,
      });

      // State
      states.set(stateCode, {
        state_code: stateCode,
        state_name: stateName,
        country_code: countryCode,
        is_active: true,
      });

      // District
      districts.set(districtCode, {
        district_code: districtCode,
        district_name: districtName,
        state_code: stateCode,
        country_code: countryCode,
        is_active: true,
      });

      // Block
      blocks.set(blockCode, {
        block_code: blockCode,
        block_name: blockName,
        sub_district_name: subDistrict,
        district_code: districtCode,
        state_code: stateCode,
        country_code: countryCode,
        is_urban: !blockName && subDistrict,
        is_active: true,
      });

      // Village (STRICT UNIQUE KEY)
      const key = `${villageCode}-${blockCode}-${districtCode}-${stateCode}`;

      villages.set(key, {
        village_code: villageCode,
        village_name: villageName,
        block_code: blockCode,
        block_name: blockName,
        sub_district_code: r.sub_district_code || null,
        sub_district_name: subDistrict,
        district_code: districtCode,
        state_code: stateCode,
        country_code: countryCode,
      });
    }

    console.log(" Countries:", countries.size);
    console.log(" States:", states.size);
    console.log(" Districts:", districts.size);
    console.log(" Blocks:", blocks.size);
    console.log(" Villages:", villages.size);

    // -----------------------------
    // STEP 3: INSERT (SAFE ORDER)
    // -----------------------------

    console.log(" Inserting countries...");
    await Country.bulkCreate([...countries.values()], {
      ignoreDuplicates: true,
    });

    console.log(" Inserting states...");
    await State.bulkCreate([...states.values()], {
      ignoreDuplicates: true,
    });

    console.log(" Inserting districts...");
    await District.bulkCreate([...districts.values()], {
      ignoreDuplicates: true,
    });

    console.log(" Inserting blocks...");
    await Block.bulkCreate([...blocks.values()], {
      ignoreDuplicates: true,
    });

    console.log(" Inserting villages (SAFE BATCH)...");

    const villageArr = [...villages.values()];
    const BATCH = 1000;

    for (let i = 0; i < villageArr.length; i += BATCH) {
      const batch = villageArr.slice(i, i + BATCH);

      try {
        await Village.bulkCreate(batch, {
          ignoreDuplicates: true,
        });

        console.log(` Villages inserted: ${i + batch.length}`);
      } catch (err) {
        console.error(` Batch failed ${i}-${i + BATCH}`, err.message);
      }
    }

    // -----------------------------
    // STEP 4: FINAL CHECK
    // -----------------------------
    console.log(" FINAL COUNTS:");

    console.log("Countries:", await Country.count());
    console.log("States:", await State.count());
    console.log("Districts:", await District.count());
    console.log("Blocks:", await Block.count());
    console.log("Villages:", await Village.count());

    console.log(" IMPORT COMPLETED SAFELY!");
  } catch (err) {
    console.error(" IMPORT FAILED:", err);
    throw err;
  }
};

// Auto run
importLocationData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export default importLocationData;
