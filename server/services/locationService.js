import axios from "axios";
import { generateCustomerIdFromLocation } from "../services/customerIdFromLocation.js";
import { User } from "../models/associations.js";

export const assignCustomerLocation = async (user, latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      console.log("⚠️ No location provided");
      return user;
    }

    console.log("📍 Processing location for user:", user.user_id);

    // skip if outside India (LGD only supports India)
    if (latitude < 6 || latitude > 38 || longitude < 68 || longitude > 98) {
      console.log("⚠️ Location outside India — skipping LGD lookup");
      return user;
    }

    let nominatimUrl = process.env.NOMINATIM_URL;

    if (nominatimUrl) {
      nominatimUrl = nominatimUrl
        .replace(/\{lat\}/g, latitude)
        .replace(/\{lon\}/g, longitude);
    }

    console.log("🌍 Calling Nominatim:", nominatimUrl);

    const geoRes = await axios.get(nominatimUrl, {
      headers: { "User-Agent": "mern-blog-app/1.0" },
      timeout: 5000, // prevent hanging
    });

    const address = geoRes.data.address || {};

    const country = address.country || "India";
    const state = address.state || address.state_district || "";
    //  ADD THIS
    const city =
      address.city || address.town || address.village || address.suburb || "";

    const display_location = [city, state, country].filter(Boolean).join(", ");
    const district =
      address.county || address.city_district || address.state_district || "";

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

    console.log("Parsed location:", {
      country,
      state,
      district,
      blockOrSub,
      village,
    });

    if (!user.customer_id) {
      const { customer_id, abbr, codes } = generateCustomerIdFromLocation({
        country,
        state,
        district,
        blockOrSub,
        village,
      });

      await user.update({
        customer_id,
        abbr,
        country_code: codes.country,
        state_code: codes.state,
        district_code: codes.district,
        block_code: codes.block,
        village_code: codes.village,

        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: new Date(),

        //  ADD THESE
        current_city: city,
        current_state: state,
        current_country: country,
        display_location,
      });

      console.log("Customer ID generated:", customer_id);
    } else {
      await user.update({
        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: new Date(),

        // ADD THESE
        current_city: city,
        current_state: state,
        current_country: country,
        display_location,
      });

      console.log("📍 Location updated");
    }

    return await User.findByPk(user.user_id);
  } catch (err) {
    console.error("⚠️ Location service error:", err.message);
    return user; // login should not fail
  }
};
