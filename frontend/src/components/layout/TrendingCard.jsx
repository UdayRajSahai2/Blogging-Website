import { useEffect, useState } from "react";
import axios from "axios";

const TrendingCard = () => {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const USE_DUMMY = true;
  const CITY = "Delhi";

  //  DUMMY DATA (REMOVE AFTER API READY)
  const dummyWeather = {
    main: { temp: 45 },
    weather: [{ description: "clear sky" }],
    name: "Delhi",
  };

  const dummyNews = [
    { title: "News", url: "#" },
    { title: "Trending", url: "#" },
  ];

  useEffect(() => {
    //  Fetch Weather
    const fetchWeather = async () => {
      if (USE_DUMMY) {
        setWeather(dummyWeather);
        setLoadingWeather(false);
        return;
      }

      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=YOUR_API_KEY`,
        );
        setWeather(res.data);
      } catch (err) {
        console.error("Weather error:", err);
        setWeather(dummyWeather); //fallback to dummy remove later
      } finally {
        setLoadingWeather(false);
      }
    };

    //  Fetch News
    const fetchNews = async () => {
      if (USE_DUMMY) {
        setNews(dummyNews);
        setLoadingNews(false);
        return;
      }

      try {
        const res = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=YOUR_API_KEY`,
        );
        setNews(res.data.articles || []);
      } catch (err) {
        console.error("News error:", err);
        setNews(dummyNews); //fallback to dummy remove later
      } finally {
        setLoadingNews(false);
      }
    };

    fetchWeather();
    fetchNews();
  }, []);

  return (
    <div className="rounded-lg p-1.5 bg-white/80 backdrop-blur border border-gray-200 shadow-sm overflow-hidden">
      {/* WEATHER BLOCK */}
      <div className="mb-2">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
          Weather
        </p>

        <div className="bg-blue-50/60 rounded-md px-2 py-1">
          {loadingWeather ? (
            <p className="text-[11px] text-gray-400">Loading...</p>
          ) : weather ? (
            <p className="flex items-center gap-2 text-[12px] text-gray-800 leading-snug">
              <span>🌡️</span>
              <span className="font-semibold">
                {Math.round(weather.main.temp)}°C
              </span>
              <span className="text-gray-500 truncate max-w-[80px]">
                {weather.weather[0].description}
              </span>
              <span className="text-gray-500 text-[10px] truncate">
                • {weather.name}
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-red-400">Unavailable</p>
          )}
        </div>
      </div>

      {/* NEWS BLOCK */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
          Trending News
        </p>

        <div className="relative overflow-hidden group">
          {loadingNews ? (
            <p className="text-[11px] text-gray-400">Loading...</p>
          ) : news.length ? (
            <div className="marquee flex gap-6 text-[12px] text-gray-700 leading-snug">
              {[...news, ...news].map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="whitespace-nowrap hover:text-blue-600 transition-colors"
                >
                  • {item.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No news</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
