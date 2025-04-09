
import React from "react";
import { Cloud, CloudRain, Sun, CloudSun, Droplets, Wind } from "lucide-react";

// Sample weather data
const weatherData = {
  current: {
    condition: "partly-cloudy",
    temperature: 18,
    humidity: 65,
    windSpeed: 12,
    precipitation: 20
  },
  forecast: [
    { day: "Tomorrow", condition: "sunny", highTemp: 21, lowTemp: 12, precipitation: 0 },
    { day: "Wednesday", condition: "cloudy", highTemp: 19, lowTemp: 11, precipitation: 10 },
    { day: "Thursday", condition: "rainy", highTemp: 16, lowTemp: 10, precipitation: 80 }
  ]
};

const WeatherCard = () => {
  const getWeatherIcon = (condition: string, size = 24) => {
    switch (condition) {
      case "sunny":
        return <Sun size={size} className="text-agrifirm-yellow" />;
      case "cloudy":
        return <Cloud size={size} className="text-agrifirm-grey" />;
      case "rainy":
        return <CloudRain size={size} className="text-agrifirm-grey" />;
      case "partly-cloudy":
        return <CloudSun size={size} className="text-agrifirm-yellow" />;
      default:
        return <Sun size={size} className="text-agrifirm-yellow" />;
    }
  };

  return (
    <div className="farm-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-agrifirm-black">Weather Forecast</h2>
        <span className="text-sm text-agrifirm-grey">Your Farm</span>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6 p-3 bg-agrifirm-light-yellow-2/30 rounded-lg">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weatherData.current.condition, 42)}
          <div>
            <span className="text-3xl font-semibold text-agrifirm-black">
              {weatherData.current.temperature}°C
            </span>
            <p className="text-sm text-agrifirm-grey capitalize">
              {weatherData.current.condition.replace("-", " ")}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-sm font-medium">{weatherData.current.humidity}%</span>
          </div>
          <div className="flex flex-col items-center">
            <Wind className="h-5 w-5 text-agrifirm-grey mb-1" />
            <span className="text-sm font-medium">{weatherData.current.windSpeed} km/h</span>
          </div>
          <div className="flex flex-col items-center">
            <CloudRain className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-sm font-medium">{weatherData.current.precipitation}%</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="space-y-2">
        {weatherData.forecast.map((day, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
          >
            <span className="font-medium text-agrifirm-black">{day.day}</span>
            <div className="flex items-center gap-2">
              {getWeatherIcon(day.condition, 20)}
              <span className="text-sm">{day.highTemp}° / {day.lowTemp}°</span>
              <span className="text-xs text-blue-500 w-8">{day.precipitation > 0 ? `${day.precipitation}%` : ''}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-agrifirm-light-green/20 text-center">
        <span className="text-xs text-agrifirm-grey">
          Weather data updated April 9, 2025, 8:00 AM
        </span>
      </div>
    </div>
  );
};

export default WeatherCard;
