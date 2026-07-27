import axios from "axios";
import { generateCustomerIdFromLocation } from "../services/customerIdFromLocation.js";

import User from "../models/user/User.js";

export const assignCustomerLocation = async (user, latitude, longitude) => {
  try {
    // VALIDATE COORDS PROPERLY
    if (
      latitude == null ||
      longitude == null ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      console.log(" No valid location provided");

      console.log(" Incoming coordinates:", {
        latitude,
        longitude,
      });

      return user;
    }

    console.log(" Processing location for user:", user.user_id);

    console.log(" Incoming coordinates:", {
      latitude,
      longitude,
    });

    //  ALWAYS SAVE RAW COORDS FIRST
    await user.update({
      current_latitude: latitude,
      current_longitude: longitude,
      location_updated_at: new Date(),
    });

    console.log(" Raw coordinates saved");

    console.log(" Checking India bounds...");

    //  OUTSIDE INDIA → SAVE COORDS ONLY
    if (latitude < 6 || latitude > 38 || longitude < 68 || longitude > 98) {
      console.log(" Outside India — saved raw coordinates only");

      console.log(" Outside India detected", {
        latitude,
        longitude,
      });

      return await User.findByPk(user.user_id);
    }

    let nominatimUrl = process.env.NOMINATIM_URL;

    if (nominatimUrl) {
      nominatimUrl = nominatimUrl
        .replace(/\{lat\}/g, latitude)
        .replace(/\{lon\}/g, longitude);
    }

    console.log(" Sending request to Nominatim...");

    const geoRes = await axios.get(nominatimUrl, {
      headers: {
        "User-Agent": "reachfoundationngo-app/1.0",
      },
      timeout: 5000,
    });

    console.log("Nominatim response received");

    const address = geoRes?.data?.address || {};

    const country = address.country || "India";

    let state =
      address.state ||
      address.region ||
      address.state_district ||
      address.county ||
      "";

    const city =
      address.city || address.town || address.village || address.suburb || "";

    //  Delhi fallback
    if (!state && city === "Delhi") {
      state = "Delhi";
    }

    const display_location = [city, state, country].filter(Boolean).join(", ");

    const district =
      address.county ||
      address.city_district ||
      address.state_district ||
      address.city ||
      "";

    const blockOrSub =
      address.city_district ||
      address.county ||
      address.residential ||
      address.city ||
      address.suburb ||
      "";

    const village =
      address.village ||
      address.city ||
      address.city_district ||
      address.county ||
      address.residential ||
      address.town ||
      address.suburb ||
      "";

    console.log("Parsed city/state:", {
      city,
      state,
      country,
    });

    console.log(" Display location:", display_location);

    console.log(" Parsed location:", {
      country,
      state,
      district,
      blockOrSub,
      village,
    });

    //  COMMON UPDATE DATA
    const updateData = {
      current_city: city,
      current_state: state,
      current_country: country,
      display_location,
    };

    //  GENERATE CUSTOMER ID ONLY ONCE
    if (!user.customer_id) {
      console.log(" Generating customer ID...");

      const { customer_id, abbr, codes } = generateCustomerIdFromLocation({
        country,
        state,
        district,
        blockOrSub,
        village,
      });

      Object.assign(updateData, {
        customer_id,
        abbr,
        country_code: codes.country,
        state_code: codes.state,
        district_code: codes.district,
        block_code: codes.block,
        village_code: codes.village,
      });

      console.log(" Customer ID generated:", {
        customer_id,
        abbr,
        codes,
      });
    }

    //  UPDATE LOCATION DETAILS
    await user.update(updateData);

    console.log(" User location/profile updated successfully");

    console.log(" Location updated");

    return await User.findByPk(user.user_id);
  } catch (err) {
    console.error(" Location service error:", err.message);

    console.error(" Full error object:", err);

    //  NEVER LOSE COORDS EVEN IF GEOCODING FAILS
    try {
      console.log(" Saving fallback coordinates...");

      await user.update({
        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: new Date(),
      });

      console.log(" Fallback coordinates saved");
    } catch (saveErr) {
      console.error(" Failed to save fallback coords:", saveErr.message);
    }

    return await User.findByPk(user.user_id);
  }
};
