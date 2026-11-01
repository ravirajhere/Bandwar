"use client";

import { useState, useEffect } from "react";
import { Clock, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog } from "lucide-react";

export function LiveWeatherWidget() {
  const [time, setTime] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);

  // 1. Local Time Update Logic (Har second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Begusarai ka time (Asia/Kolkata)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Weather Fetch Logic (Open-Meteo API)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Bandwar (Begusarai) ke coordinates: 25.5009, 86.1606
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=25.5009&longitude=86.1606&current=temperature_2m,weather_code&timezone=Asia%2FKolkata"
        );
        const data = await res.json();
        if (data.current) {
          setTemp(Math.round(data.current.temperature_2m));
          setWeatherCode(data.current.weather_code);
        }
      } catch (error) {
        console.error("Weather fetch failed", error);
      }
    };

    fetchWeather();
    // Har 30 minute me weather update karega
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Weather Code ko Icon me convert karna (Muted & Professional Colors)
  const getWeatherIcon = (code: number | null) => {
    const iconClass = "text-ink/60 3xl:w-5 3xl:h-5"; // Default fallback size and color
    
    if (code === null) return <Cloud size={14} className={iconClass} />;
    if (code === 0) return <Sun size={14} className="text-amber-500/80 3xl:w-5 3xl:h-5" />; // Clear
    if (code >= 1 && code <= 3) return <Cloud size={14} className="text-slate-400/80 3xl:w-5 3xl:h-5" />; // Partly cloudy
    if (code >= 45 && code <= 48) return <CloudFog size={14} className="text-slate-500/80 3xl:w-5 3xl:h-5" />; // Fog
    if (code >= 51 && code <= 65) return <CloudRain size={14} className="text-blue-500/80 3xl:w-5 3xl:h-5" />; // Rain
    if (code >= 71 && code <= 77) return <CloudSnow size={14} className="text-blue-300/80 3xl:w-5 3xl:h-5" />; // Snow
    if (code >= 95) return <CloudLightning size={14} className="text-purple-500/80 3xl:w-5 3xl:h-5" />; // Thunderstorm
    return <Cloud size={14} className={iconClass} />;
  };

  return (
    <div 
      className="inline-flex items-center gap-3 3xl:gap-4 bg-surface border border-divider px-3 py-1.5 3xl:px-5 3xl:py-2.5 rounded-md text-xs 3xl:text-sm font-medium text-ink/80 shadow-sm hover:shadow-md transition-all duration-300"
      aria-label="Live time and weather for Bandwar"
    >
      
      {/* Time Section */}
      <div className="flex items-center gap-1.5 3xl:gap-2">
        <Clock size={14} className="text-accent 3xl:w-5 3xl:h-5" />
        <span className="tabular-nums tracking-wide">{time} (IST)</span>
      </div>

      {/* Divider */}
      <span className="w-px h-3 3xl:h-4 bg-divider" aria-hidden="true"></span>

      {/* Weather Section */}
      <div className="flex items-center gap-1.5 3xl:gap-2">
        {getWeatherIcon(weatherCode)}
        <span className="tabular-nums">{temp !== null ? `${temp}°C` : "--°C"}</span>
        <span className="text-[10px] 3xl:text-xs text-ink/40 uppercase tracking-wider ml-0.5">
          Bandwar
        </span>
      </div>

    </div>
  );
}