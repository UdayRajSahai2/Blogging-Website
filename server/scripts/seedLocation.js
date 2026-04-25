import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "../config/db.config.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";

// Fix __dirname (ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORRECT PATHS
const stateFilePath = path.join(__dirname, "../data/state_codes.json");
const districtFilePath = path.join(__dirname, "../data/district_codes.json");

async function seed() {
  try {
    console.log("Seeding started...");

    await sequelize.authenticate();
    console.log("DB connected");

    // =========================
    // READ FILES
    // =========================
    const stateRaw = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
    const districtRaw = JSON.parse(fs.readFileSync(districtFilePath, "utf-8"));

    // =========================
    // TRANSFORM STATES
    // =========================
    const states = stateRaw.map((s) => ({
      state_code: s.tin, // IMPORTANT (numeric)
      state_name: s.state.toUpperCase(),
      country_code: "356",
      is_active: true,
    }));

    // =========================
    // TRANSFORM DISTRICTS
    // =========================
    const districts = districtRaw.records.map((r) => ({
      district_name: r[2].toUpperCase(),
      district_code: r[3].padStart(4, "0"), // match model
      state_code: r[7],
      country_code: "356",
      is_active: true,
    }));

    console.log(`States: ${states.length}`);
    console.log(`Districts: ${districts.length}`);

    // =========================
    // INSERT STATES
    // =========================
    await State.bulkCreate(states, {
      ignoreDuplicates: true,
    });

    console.log("States inserted");

    // =========================
    // INSERT DISTRICTS
    // =========================
    await District.bulkCreate(districts, {
      ignoreDuplicates: true,
    });

    console.log(" Districts inserted");

    process.exit(0);
  } catch (err) {
    console.error(" Seeding failed:", err);
    process.exit(1);
  }
}

seed();
