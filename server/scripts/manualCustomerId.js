import fetch from "node-fetch";
import { generateCustomerIdFromLocation } from "../services/customerIdFromLocation.js";

//  CHANGE ONLY THIS
const latitude = 28.587267;
const longitude = 77.035942;

// const latitude = 26.88136404;
// const longitude = 81.00317627;

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

    console.log("📨 Input to generator:", input);

    const result = generateCustomerIdFromLocation(input);

    console.log("\n==============================");
    console.log("Customer ID:", result.customer_id);
    console.log("Abbr:", result.abbr);
    console.log("==============================\n");
  } catch (err) {
    console.error(" Failed:", err.message);
  }
}

run();
