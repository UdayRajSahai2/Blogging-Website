import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient.js";
import MapPinIcon from "@heroicons/react/24/solid/MapPinIcon";
import CloudIcon from "@heroicons/react/24/solid/CloudIcon";
import FireIcon from "@heroicons/react/24/solid/FireIcon";
import SunIcon from "@heroicons/react/24/solid/SunIcon";

import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
} from "react-icons/wi";

const TrendingCard = () => {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        const { data } = await apiClient.get(
          "/api/daily-feed/weather/current",
          {
            params: {
              latitude,
              longitude,
            },
          },
        );

        setWeather(data);
      } catch (err) {
        console.error("Weather error:", err);

        setWeather((prev) => ({
          city: prev?.city || "Current Location",
          temperature_2m: 30,
          weather_code: 1,
        }));
      } finally {
        setLoadingWeather(false);
      }
    };

    const fetchNews = async () => {
      try {
        const { data } = await apiClient.get("/api/daily-feed/news");

        setNews(data);
      } catch (err) {
        console.error("News error:", err);
        setNews([]);
      } finally {
        setLoadingNews(false);
      }
    };

    const cached = JSON.parse(localStorage.getItem("userLocation"));

    if (
      cached &&
      Date.now() - cached.timestamp < 10 * 60 * 1000 // 10 minutes
    ) {
      fetchWeather(cached.latitude, cached.longitude);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          };

          localStorage.setItem("userLocation", JSON.stringify(location));

          fetchWeather(location.latitude, location.longitude);
        },
        (err) => {
          console.error("Location error:", err);
          setLoadingWeather(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    }

    fetchNews();
  }, []);

  const getWeatherDescription = (code) => {
    const map = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog",
      51: "Light Drizzle",
      53: "Drizzle",
      55: "Heavy Drizzle",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      71: "Light Snow",
      73: "Snow",
      75: "Heavy Snow",
      80: "Rain Showers",
      81: "Heavy Showers",
      82: "Violent Showers",
      95: "Thunderstorm",
      96: "Thunderstorm with Hail",
      99: "Severe Thunderstorm with Hail",
    };
    return map[code] || "Weather unavailable";
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return WiDaySunny;
    if (code === 1 || code === 2) return WiDaySunny;
    if (code === 3) return WiCloudy;

    if ([45, 48].includes(code)) return WiFog;

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return WiRain;

    if ([71, 73, 75].includes(code)) return WiSnow;

    if ([95, 96, 99].includes(code)) return WiThunderstorm;

    return WiCloudy;
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.weather_code) : WiCloudy;

  return (
    <div className="rounded-lg p-1.5 bg-white/80 backdrop-blur border border-gray-200 shadow-sm overflow-hidden">
      {/* WEATHER BLOCK */}
      <div className="mb-2">
        <div className="px-1 pb-1 flex items-center gap-1 text-gray-700">
          <CloudIcon className="w-3.5 h-3.5 text-blue-500" />
          <p className="font-semibold text-[11px] tracking-wide">WEATHER</p>
        </div>

        <div className="bg-blue-50/60 rounded-md px-1 py-1">
          {loadingWeather ? (
            <p className="text-[11px] text-gray-500 animate-pulse">
              Detecting your location...
            </p>
          ) : weather ? (
            <div className="flex flex-col text-[12px] text-gray-800 gap-1 w-full overflow-hidden">
              <div className="flex items-start gap-2 w-full">
                <WeatherIcon className="text-3xl text-yellow-500 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-600 truncate">
                      {weather.city}
                    </span>

                    <span className="font-semibold text-sm">
                      {Math.round(weather.temperature_2m)}°C
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 truncate">
                    {getWeatherDescription(weather.weather_code)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-red-400">Unavailable</p>
          )}
        </div>
      </div>

      {/* NEWS BLOCK */}
      <div>
        <div className="px-1 pb-1 flex items-center gap-1 text-gray-700">
          <FireIcon className="w-3.5 h-3.5 text-orange-500" />

          <p className="font-semibold text-[11px] tracking-wide">
            TRENDING NEWS
          </p>
        </div>

        <div className="relative overflow-hidden group">
          {loadingNews ? (
            <p className="text-[11px] text-gray-500 animate-pulse">
              Fetching latest news...
            </p>
          ) : news.length > 0 ? (
            <div className="marquee flex gap-6 text-[12px] text-gray-700 leading-snug">
              {[...news, ...news].map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap hover:text-blue-600 transition-colors"
                >
                  • {item.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-500">No news available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
