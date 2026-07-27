//server\services\dailyFeedService.js
import axios from "axios";
import Parser from "rss-parser";

//Weather Service
export const getWeather = async (latitude, longitude) => {
  const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude,
      longitude,
      current: "temperature_2m,weather_code",
    },
  });

  return response.data.current;
};

export const getCityFromCoordinates = async (latitude, longitude) => {
  const { data } = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: {
        lat: latitude,
        lon: longitude,
        format: "json",
      },
      headers: {
        "User-Agent": "reachfoundationngo-app/1.0",
      },
    },
  );

  const address = data.address || {};

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.county ||
    address.state_district;

  const state = address.state;

  return [city, state].filter(Boolean).join(", ") || "Current Location";
};

//News Service
const parser = new Parser();

export const getTopNews = async () => {
  const feed = await parser.parseURL(
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  );

  return feed.items.slice(0, 10).map((item) => ({
    title: item.title,
    url: item.link,
    publishedAt: item.pubDate,
    source: item.source?.title || "Google News",
  }));
};
