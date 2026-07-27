import fetch from "node-fetch";
import { generateCustomerIdFromLocation } from "../services/customerIdFromLocation.js";

//  CHANGE ONLY THIS
const latitude = 28.66680261;
const longitude = 77.23186102;

// SAME reverse geocode your backend should use
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "reachfoundationngo",
    },
  });

  const data = await res.json();
  return data.address;
}

async function run() {
  try {
    console.log(" Using lat/lng:", latitude, longitude);

    const address = await reverseGeocode(latitude, longitude);

    console.log("Raw address:", address);

    //  IMPORTANT: same mapping as backend
    const input = {
      country: address.country,

      //  FIX STATE (MANDATORY)
      state:
        address.state ||
        (address["ISO3166-2-lvl4"] === "IN-DL" ? "Delhi" : undefined) ||
        address.city,

      //  FIX DISTRICT
      district: address.state_district || address.city_district || address.city,

      blockOrSub:
        address.suburb || address.neighbourhood || address.city_district,

      village: address.village || address.town || address.city,

      city: address.city,
      city_district: address.city_district,
      county: address.county,
      residential: address.residential,
    };

    console.log(" Input to generator:", input);

    const result = generateCustomerIdFromLocation(input);

    const customerId = result.customer_id.replace(/\s+/g, "");

    // Extract codes
    const country_code = customerId.slice(0, 3);
    const state_code = customerId.slice(3, 5);
    const district_code = customerId.slice(5, 7);
    const block_code = customerId.slice(7, 9);
    const village_code = customerId.slice(9, 12);
    const unique_code = customerId.slice(12);

    // Location details
    const current_city =
      address.city || address.town || address.village || address.municipality;

    const current_state =
      address.state || (address["ISO3166-2-lvl4"] === "IN-DL" ? "Delhi" : "");

    const current_country = address.country;

    const display_location = [current_city, current_state, current_country]
      .filter(Boolean)
      .join(", ");

    console.log("\n==============================");
    console.log("Customer ID      :", result.customer_id);
    console.log("Abbr             :", result.abbr);
    console.log("------------------------------");
    console.log("country_code     :", country_code);
    console.log("state_code       :", state_code);
    console.log("district_code    :", district_code);
    console.log("block_code       :", block_code);
    console.log("village_code     :", village_code);
    console.log("unique_code      :", unique_code);
    console.log("------------------------------");
    console.log("display_location :", display_location);
    console.log("current_city     :", current_city);
    console.log("current_state    :", current_state);
    console.log("current_country  :", current_country);
    console.log("==============================\n");
  } catch (err) {
    console.error(" Failed:", err.message);
  }
}

run();
