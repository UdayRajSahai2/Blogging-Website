import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your LGD data file
const DATA_PATH = path.join(__dirname, '..', 'data', 'village-lgd-codes.json');

// Load and parse the JSON
const rawData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
const fields = rawData.fields.map(f => f.id);
const records = rawData.records;
const idx = field => fields.indexOf(field);

// === CHANGE THESE VALUES TO DRILL DOWN ===
const state = 'DELHI'; // e.g., 'NCT OF DELHI'
const district = 'SOUTH WEST'; // e.g., 'South West'
const block = 'DWARKA'; // e.g., 'Dwarka'

// 1. List all unique states
const states = [...new Set(records.map(r => r[idx('state_name')]))];
console.log('States:', states);

// 2. List all unique districts for a state
if (state) {
  const districts = [
    ...new Set(
      records
        .filter(r => r[idx('state_name')] === state)
        .map(r => r[idx('district_name')])
    ),
  ];
  console.log(`Districts in ${state}:`, districts);

  // 3. List all unique blocks for a district
  if (district) {
    const blocks = [
      ...new Set(
        records
          .filter(
            r =>
              r[idx('state_name')] === state &&
              r[idx('district_name')] === district
          )
          .map(r => r[idx('block_name')])
      ),
    ];
    console.log(`Blocks in ${district}, ${state}:`, blocks);

    // 4. List all unique villages for a district (ignoring block)
    if (district) {
      const villages = [
        ...new Set(
          records
            .filter(
              r =>
                r[idx('state_name')] === state &&
                r[idx('district_name')] === district
            )
            .map(r => r[idx('village_name')])
        ),
      ];
      console.log(`Villages in ${district}, ${state}:`, villages);
    }
  }
}
