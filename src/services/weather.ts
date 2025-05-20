import { type WeatherForecastItem, type WeatherLocation } from '../components/types/weatherDataTypes';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.openweathermap.org';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const fetchWeatherByCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{
  currentWeather: WeatherForecastItem;
  location: WeatherLocation;
}> => {
  const currentResponse = await fetch(
    `${BASE_URL}/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
  );

  if (!currentResponse.ok) {
    throw new Error('Failed to fetch current weather for your location');
  }

  const currentData = await currentResponse.json();

  const location: WeatherLocation = {
    name: currentData.name,
    country: currentData.sys.country,
    lat: currentData.coord.lat,
    lon: currentData.coord.lon,
  };

  return {
    currentWeather: currentData,
    location,
  };
};

export const fetchWeatherForecast = async (
  lat: number,
  lon: number
): Promise<WeatherForecastItem[]> => {
  const forecastResponse = await fetch(
    `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  if (!forecastResponse.ok) {
    throw new Error('Failed to fetch forecast data');
  }

  const forecastData = await forecastResponse.json();
  return forecastData.list;
};
