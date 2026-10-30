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

  // 3. Weather Code ko Icon me convert karna
  const getWeatherIcon = (code: number | null) => {
    if (code === null) return <Cloud size={14} className="text-muted" />;
    if (code === 0) return <Sun size={14} className="text-yellow-500" />; // Clear
    if (code >= 1 && code <= 3) return <Cloud size={14} className="text-gray-400" />; // Partly cloudy
    if (code >= 45 && code <= 48) return <CloudFog size={14} className="text-gray-500" />; // Fog
    if (code >= 51 && code <= 65) return <CloudRain size={14} className="text-blue-500" />; // Rain
    if (code >= 71 && code <= 77) return <CloudSnow size={14} className="text-blue-300" />; // Snow
    if (code >= 95) return <CloudLightning size={14} className="text-purple-500" />; // Thunderstorm
    return <Cloud size={14} className="text-muted" />;
  };

  return (
    <div className="inline-flex items-center gap-3 bg-muted-background border border-border px-3 py-1.5 rounded-full text-xs font-medium text-foreground/80 shadow-sm hover:shadow transition-shadow">
      
      {/* Time Section */}
      <div className="flex items-center gap-1.5">
        <Clock size={14} className="text-brand" />
        <span className="tabular-nums tracking-wide">{time} (IST)</span>
      </div>

      {/* Divider */}
      <span className="w-px h-3 bg-border"></span>

      {/* Weather Section */}
      <div className="flex items-center gap-1.5">
        {getWeatherIcon(weatherCode)}
        <span>{temp !== null ? `${temp}°C` : "--°C"}</span>
        <span className="text-[10px] text-muted uppercase tracking-wider ml-0.5">Bandwar</span>
      </div>

    </div>
  );
}