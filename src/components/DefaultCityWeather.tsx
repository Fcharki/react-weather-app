
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, CloudFog, CloudDrizzle, Loader } from 'lucide-react';
import cloudy from '../assets/images/clouds.jpg';
import WeatherNavBar from './MinimalistNavBar';

// Types for weather data
interface WeatherLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  dt_txt?: string;
}

interface DailyForecast {
  time: string;
  temp: string;
  icon: React.JSX.Element;
  description: string;
}

interface WeeklyForecastItem {
  day: string;
  temp: string;
  icon: React.JSX.Element;
  description: string;
}

// Component
const WeatherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherForecastItem | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<DailyForecast[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecastItem[]>([]);

  // Get weather icon based on condition code
  const getWeatherIcon = (code: number, size: number = 24): React.JSX.Element => {
    if (code >= 200 && code < 300) return <CloudLightning size={size} />; // thunderstorm
    if (code >= 300 && code < 400) return <CloudDrizzle size={size} />; // drizzle
    if (code >= 500 && code < 600) return <CloudRain size={size} />; // rain
    if (code >= 600 && code < 700) return <CloudRain size={size} />; // snow
    if (code >= 700 && code < 800) return <CloudFog size={size} />; // fog/mist
    if (code === 800) return <Sun size={size} />; // clear sky
    return <Cloud size={size} />; // clouds
  };

  // Format temperature
  const formatTemp = (temp: number): string => {
    return `${Math.round(temp)}°`;
  };

  // Format date/time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDay = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString([], { weekday: 'short' });
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    return `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${now.toLocaleDateString([], {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    })}`;
  };

  // Get user location
  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchLocationName(latitude, longitude);
        fetchWeatherData(latitude, longitude);
      },
      err => {
        setError(`Error getting location: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Fetch location name from coordinates
  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setLocation({
          name: data[0].name,
          country: data[0].country,
          lat,
          lon
        });
      }
    } catch (err) {
      console.error('Error fetching location name:', err);
      setError('Error fetching location data');
    }
  };

  // fetch weather data
  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      //  fetch current weather
      const currentResponse = await fetch(
        `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch current weather');
      }
      
      const currentData = await currentResponse.ok ? await currentResponse.json() : null;
      
      // fetch 5-day forecast for hourly and weekly data
      const forecastResponse = await fetch(
        `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const forecastData = await forecastResponse.json();
      
      if (currentData) {
        setCurrentWeather(currentData);
      }
      
      if (forecastData && forecastData.list) {
        processHourlyForecast(forecastData.list);
        processWeeklyForecast(forecastData.list);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Error fetching weather data');
      setLoading(false);
    }
  };

  // hourly forecast data (every 3 hours)
  const processHourlyForecast = (forecastList: WeatherForecastItem[]) => {
    // Get next 7 forecasts
    const next21Hours = forecastList.slice(0, 7);
    
    const processed: DailyForecast[] = next21Hours.map((item) => {
      return {
        time: item.dt_txt ? item.dt_txt.split(' ')[1].substring(0, 5) : formatTime(item.dt),
        temp: formatTemp(item.main.temp),
        icon: getWeatherIcon(item.weather[0].id, 20),
        description: item.weather[0].description
      };
    });
    
    // add "Now" as first item
    processed[0].time = 'Now';
    
    setHourlyForecast(processed);
  };

  // weekly forecast data
  const processWeeklyForecast = (forecastList: WeatherForecastItem[]) => {
    // group forecasts by day
    const dailyForecasts: { [key: string]: WeatherForecastItem[] } = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = [];
      }
      
      dailyForecasts[dateKey].push(item);
    });
    
    // get average for each day
    const processedDays: WeeklyForecastItem[] = Object.keys(dailyForecasts).map(dateKey => {
      const forecasts = dailyForecasts[dateKey];
      const totalTemp = forecasts.reduce((sum, item) => sum + item.main.temp, 0);
      const avgTemp = totalTemp / forecasts.length;
      
      // find most common weather condition
      const weatherCounts: { [id: number]: number } = {};
      forecasts.forEach(item => {
        const id = item.weather[0].id;
        weatherCounts[id] = (weatherCounts[id] || 0) + 1;
      });
      
      let mostCommonWeatherId = forecasts[0].weather[0].id;
      let highestCount = 0;
      
      Object.entries(weatherCounts).forEach(([id, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostCommonWeatherId = parseInt(id);
        }
      });
      
      const firstForecast = forecasts[0];
      const description = forecasts.find(f => f.weather[0].id === mostCommonWeatherId)?.weather[0].description || '';
      
      return {
        day: formatDay(firstForecast.dt),
        temp: formatTemp(avgTemp),
        icon: getWeatherIcon(mostCommonWeatherId, 24),
        description
      };
    });
    
    // limit to 7 days
    setWeeklyForecast(processedDays.slice(0, 7));
  };

  // initialize component
  useEffect(() => {
    getUserLocation();
  }, []);

  // refresh weather data
  const handleRefresh = () => {
    if (location) {
      setLoading(true);
      fetchWeatherData(location.lat, location.lon);
    } else {
      getUserLocation();
    }
  };

  return (
    <>
    <WeatherNavBar />
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4"
      style={{ backgroundImage: `url(${cloudy})` }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 text-gray-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size={48} className="animate-spin mb-4" />
            <p>Getting your weather data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={getUserLocation}
              className="px-4 py-2 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-full"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Tab Selector */}
            <div className="flex justify-center mb-8 w-full">
              <div className="bg-white bg-opacity-30 rounded-full p-1 flex z-10">
                <button
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === 'day' ? 'bg-white shadow-sm' : 'hover:bg-white hover:bg-opacity-20'
                  }`}
                  onClick={() => setActiveTab('day')}
                >
                  Day
                </button>
                <button
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === 'week' ? 'bg-white shadow-sm' : 'hover:bg-white hover:bg-opacity-20'
                  }`}
                  onClick={() => setActiveTab('week')}
                >
                  Week
                </button>
              </div>
            </div>

            {/* Current Weather */}
            <div className="px-4 mb-8">
              <div className="flex items-baseline">
                <h1 className="text-7xl font-light">
                  {currentWeather ? formatTemp(currentWeather.main.temp) : '-'}
                </h1>
                <div className="ml-4">
                  <h2 className="text-3xl font-medium">{location?.name || 'Unknown'}</h2>
                  <p className="text-lg text-gray-700">{location?.country || ''}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-700">
                <span>{getCurrentDateTime()}</span>
                {currentWeather && (
                  <>
                    <span className="ml-2 mr-1">
                      {getWeatherIcon(currentWeather.weather[0].id, 18)}
                    </span>
                    <span className="capitalize">{currentWeather.weather[0].description}</span>
                  </>
                )}
              </div>
              
              <div className="mt-2 flex text-sm text-gray-700">
                {currentWeather && (
                  <span>Humidity: {currentWeather.main.humidity}% • Feels like: {formatTemp(currentWeather.main.feels_like)}</span>
                )}
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-white bg-opacity-30 rounded-xl p-4 w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {activeTab === 'day' ? '24-hour forecast' : '7-day forecast'}
                </h3>
                <button 
                  onClick={handleRefresh} 
                  className="text-sm flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full"
                >
                  <span>Refresh</span>
                </button>
              </div>

              {activeTab === 'day' ? (
                hourlyForecast.length > 0 ? (
                  <div className="relative">
                    {/* Weather Icons */}
                    <div className="flex justify-between mb-2">
                      {hourlyForecast.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="text-gray-600">{item.icon}</div>
                        </div>
                      ))}
                    </div>

                    {/* Temperature */}
                    <div className="flex justify-between mb-2">
                      {hourlyForecast.map((item, i) => (
                        <div key={i} className="text-center font-medium">
                          {item.temp}
                        </div>
                      ))}
                    </div>

                    {/* Hours */}
                    <div className="flex justify-between text-xs text-gray-600">
                      {hourlyForecast.map((item, i) => (
                        <div key={i} className="text-center">
                          {item.time}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4">No hourly forecast available</p>
                )
              ) : weeklyForecast.length > 0 ? (
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-4 md:grid-cols-7 sm:gap-3">
                  {weeklyForecast.map((day, index) => (
                    <div key={index} className="flex justify-center">
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex flex-row sm:flex-col items-center justify-between sm:justify-center w-full">
                        <div className="text-lg font-medium sm:text-2xl md:text-3xl sm:font-light">{day.day}</div>
                        <div className="flex items-center mx-2 sm:mx-0 sm:my-2">{day.icon}</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-medium">{day.temp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">No weekly forecast available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default WeatherDashboard;