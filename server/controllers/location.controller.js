import Country from "../models/locations/Country.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";

/* -------- GET COUNTRIES -------- */
export const getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      where: { is_active: true },
      attributes: ["country_code", "country_name"],
      order: [["country_name", "ASC"]],
    });

    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

/* -------- GET STATES -------- */
export const getStates = async (req, res) => {
  try {
    const { country_code } = req.query;

    const states = await State.findAll({
      where: { country_code, is_active: true },
      attributes: ["state_code", "state_name"],
      order: [["state_name", "ASC"]],
    });

    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch states" });
  }
};

/* -------- GET DISTRICTS -------- */
export const getDistricts = async (req, res) => {
  try {
    const { state_code } = req.query;

    const districts = await District.findAll({
      where: { state_code, is_active: true },
      attributes: ["district_code", "district_name"],
      order: [["district_name", "ASC"]],
    });

    res.json(districts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
};
