import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON files
const VILLAGE_PATH = path.join(__dirname, '../data/village-lgd-codes.json');
const COUNTRY_PATH = path.join(__dirname, '../data/country_codes.json');

const villageRaw = JSON.parse(fs.readFileSync(VILLAGE_PATH, 'utf-8'));
const countryRaw = JSON.parse(fs.readFileSync(COUNTRY_PATH, 'utf-8'));

const villageFields = villageRaw.fields.map(f => f.id);
const villageRecords = villageRaw.records;

// Build a hash map for country codes (by country name, uppercased)
const countryMap = {};
for (const c of countryRaw) {
  countryMap[c.country.trim().toUpperCase()] = c.numeric.padStart(3, '0');
}

function normalize(str) {
  return (str || '').trim().toUpperCase();
}

function partialMatch(a, b) {
  return normalize(a).includes(normalize(b)) || normalize(b).includes(normalize(a));
}

/**
 * Generate a customer_id and abbreviation using LGD codes from in-memory JSON.
 * @param {Object} param0
 * @param {string} param0.country - Country name (not code)
 * @param {string} param0.state - State name
 * @param {string} param0.district - District name
 * @param {string} param0.blockOrSub - Block/Zone/Sub-district/Ward name
 * @param {string} param0.village - Village name
 * @returns {{customer_id: string, abbr: string, codes: object}}
 */
export function generateCustomerIdFromLocation({ country = 'India', state, district, blockOrSub, village, city, city_district, county, residential }) {
  const normCountry = normalize(country);
  const normState = normalize(state);
  const normDistrict = normalize(district);
  const normBlockOrSub = normalize(blockOrSub);
  const normVillage = normalize(village);
  const normCity = normalize(city);
  const normCityDistrict = normalize(city_district);
  const normCounty = normalize(county);
  const normResidential = normalize(residential);

  // Find country code
  const countryCode = countryMap[normCountry] || '356';

  // Try to find a matching LGD record with flexible logic
  let record = null;
  for (const rec of villageRecords) {
    const obj = Object.fromEntries(villageFields.map((f, i) => [f, rec[i]]));
    // Flexible matching for urban areas
    const lgdState = normalize(obj.state_name);
    const lgdDistrict = normalize(obj.district_name);
    const lgdSubDistrict = normalize(obj.sub_district_name);
    const lgdVillage = normalize(obj.village_name);

    // Match state
    if (lgdState !== normState) continue;

    // Match district (try all possible nominatim fields)
    if (
      !(partialMatch(lgdDistrict, normDistrict) ||
        partialMatch(lgdDistrict, normCounty) ||
        partialMatch(lgdDistrict, normCityDistrict) ||
        partialMatch(lgdDistrict, normCity) ||
        partialMatch(lgdDistrict, normBlockOrSub))
    ) continue;

    // Match sub_district (try city, city_district, county)
    if (
      !(partialMatch(lgdSubDistrict, normCity) ||
        partialMatch(lgdSubDistrict, normCityDistrict) ||
        partialMatch(lgdSubDistrict, normCounty) ||
        partialMatch(lgdSubDistrict, normBlockOrSub))
    ) continue;

    // Match village (try village, city, residential, etc.)
    if (
      !(partialMatch(lgdVillage, normVillage) ||
        partialMatch(lgdVillage, normCity) ||
        partialMatch(lgdVillage, normResidential) ||
        partialMatch(lgdVillage, normBlockOrSub))
    ) continue;

    // If all match, use this record
    record = obj;
    break;
  }

  if (!record) {
    throw new Error('No matching village record found for the provided location');
  }

  // Extract and trim codes as per format
  // 3-digit country, 2-digit state, 2-digit district, 2-digit block/sub, 3-digit village
  const stateCode = (record.state_code || '').slice(-2).padStart(2, '0');
  const districtCode = (record.district_code || '').slice(-2).padStart(2, '0');
  // Use block_code or sub_district_code as per availability
  let blockCode = (record.block_code || '');
  if (!blockCode && record.sub_district_code) blockCode = record.sub_district_code;
  blockCode = (blockCode || '').slice(-2).padStart(2, '0');
  const villageCode = (record.village_code || '').slice(-3).padStart(3, '0');
  const randomCode = Math.floor(1000 + Math.random() * 9000);

  // Abbreviation: e.g., ST-DT-BK-VL
  const abbr = [
    (record.state_name || '').slice(0,2).toUpperCase(),
    (record.district_name || '').slice(0,2).toUpperCase(),
    (record.block_name || record.sub_district_name || '').slice(0,2).toUpperCase(),
    (record.village_name || '').slice(0,2).toUpperCase()
  ].join('-');

  const customer_id = `${countryCode}${stateCode}${districtCode}${blockCode}${villageCode}${randomCode}`;
  return {
    customer_id,
    abbr,
    codes: {
      country: countryCode,
      state: stateCode,
      district: districtCode,
      block: blockCode,
      village: villageCode
    }
  };
} 