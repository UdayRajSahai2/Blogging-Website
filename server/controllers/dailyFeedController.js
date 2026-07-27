//server\controllers\dailyFeedController.js
import User from "../models/user/User.js";

import {
  getCityFromCoordinates,
  getWeather,
  getTopNews,
} from "../services/dailyFeedService.js";

// Weather
export const currentWeather = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "Latitude and longitude are required",
    });
  }

  try {
    const city = await getCityFromCoordinates(latitude, longitude);

    try {
      const weather = await getWeather(latitude, longitude);

      return res.json({
        city,
        ...weather,
      });
    } catch (weatherErr) {
      console.error("Weather API failed:", weatherErr.message);

      // Fallback weather
      return res.json({
        city,
        temperature_2m: 30,
        weather_code: 1, // Mainly Clear
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Unable to determine your location.",
    });
  }
};

//News
export const getNews = async (req, res) => {
  try {
    const news = await getTopNews();

    res.json(news);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
