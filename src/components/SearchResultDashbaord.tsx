import React, { useState, useEffect } from 'react';
import { Loader, Search, RefreshCw } from 'lucide-react';
import { type WeatherLocation, type WeatherForecastItem, type DailyForecast, type WeeklyForecastItem 
                                                                 } from './types/weatherDataTypes';
                                                                 

//* background images 
import cloudy from '../assets/images/clouds.jpg';
import sunny from '../assets/images/sunny.jpg';
import rainy from '../assets/images/rain.jpg';
import mist from '../assets/images/mist.jpg';
import dust from '../assets/images/dust.jpg';
import snowy from '../assets/images/snowy.jpg';
import thunder from '../assets/images/thunder.jpg';
import tornado from '../assets/images/tornado.jpg';
import thunderstorm from '../assets/images/thunderstorm.jpg';
import drizzle from '../assets/images/drizzle.jpg';
import windy from '../assets/images/windy.jpg';

interface SearchWeatherDashboardProps {
  city?: string;
  locationError?: string | null;
}

const SearchWeatherDashboard: React.FC<SearchWeatherDashboardProps> = ({ city, locationError }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(locationError || null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherForecastItem | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<DailyForecast[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecastItem[]>([]);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(0); // Store timezone offset separately


  //* background image map
const backgroundImageMap: Record<string, string> = {
  sunny,
  rainy,
  snowy,
  thunder,
  thunderstorm,
  drizzle,
  mist,
  dust,
  tornado,
  windy,
  cloudy,
};


//* normalizing the condition
const normalizeWeatherCondition = (desc: string): string => {
  const d = desc.toLowerCase();
  if (d.includes("sun")) return "sunny";
  if (d.includes("cloud")) return "cloudy";
  if (d.includes("rain")) return "rainy";
  if (d.includes("snow")) return "snowy";
  if (d.includes("drizzle")) return "drizzle";
  if (d.includes("thunderstorm")) return "thunderstorm";
  if (d.includes("thunder")) return "thunder";
  if (d.includes("mist")) return "mist";
  if (d.includes("dust")) return "dust";
  if (d.includes("tornado")) return "tornado";
  if (d.includes("wind")) return "windy";
  return "cloudy"; // default fallback
};


const currentCondition = currentWeather?.weather?.[0]?.description || '';
const normalized = normalizeWeatherCondition(currentCondition);
const backgroundImage = backgroundImageMap[normalized];



  // Get weather icon based on condition code
const getWeatherIcon = (iconCode: string, size = 48): React.JSX.Element => {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return <img src={iconUrl} alt="weather icon" width={size} height={size} />;
};

  // Format temperature
  const formatTemp = (temp: number): string => {
    return `${Math.round(temp)}°`;
  };

  // Format date/time
  const formatTime = (timestamp: number): string => {
    const localTimestamp = (timestamp + timezoneOffset) * 1000; // apply offset, convert to ms
    const date = new Date(localTimestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDay = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };


  const getCurrentDateTime = (timezoneOffsetSeconds: number): string => {
    // Get current UTC timestamp in seconds
    const utcTimestamp = Math.floor(Date.now() / 1000);

    // Apply timezone offset (API returns offset in seconds from UTC)
    const localTimestamp = (utcTimestamp + timezoneOffsetSeconds) * 1000; // Convert to ms
    const localDate = new Date(localTimestamp);

    const time = localDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, 
    });

    const date = localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });

    return `${time} - ${date}`;
  };




  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.openweathermap.org';
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Fetch weather data when city changes
  useEffect(() => {
    if (city && city.trim() !== '') {
      setLoading(true);
      setError(null);
      fetchWeatherByCity(city);
    }
  }, [city]);

  // Fetch weather data by city name
  const fetchWeatherByCity = async (cityName: string) => {
    try {
      // Fetch current weather first to get coordinates
      const currentResponse = await fetch(
        `${BASE_URL}/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Failed to fetch weather for ${cityName}`);
      }
      
      const currentData = await currentResponse.json();
      
      setCurrentWeather(currentData);
      
      // Extract timezone offset from the API response
      const timezoneOffsetFromAPI = currentData.timezone || 0; // timezone is in seconds
      setTimezoneOffset(timezoneOffsetFromAPI);
      
      setLocation({
        name: currentData.name,
        country: currentData.sys.country,
        lat: currentData.coord.lat,
        lon: currentData.coord.lon
      });
      
      // Then fetch forecast with coordinates
      await fetchWeatherForecast(currentData.coord.lat, currentData.coord.lon);
      
    } catch (err) {
      console.error('Error fetching city weather:', err);
      setError(`Could not find weather for "${cityName}". Please check the city name or your network and try again.`);
      setLoading(false);
    }
  };

  // fetch weather forecast data
  const fetchWeatherForecast = async (lat: number, lon: number) => {
    try {
      // fetch 5-day forecast for hourly and weekly data
      const forecastResponse = await fetch(
        `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const forecastData = await forecastResponse.json();
      
      if (forecastData && forecastData.list) {
        processHourlyForecast(forecastData.list);
        processWeeklyForecast(forecastData.list);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather forecast:', err);
      setError('Error fetching forecast data');
      setLoading(false);
    }
  };

  // hourly forecast data (every 3 hours)
  const processHourlyForecast = (forecastList: WeatherForecastItem[]) => {
    // Get next 7 forecasts (approximately 21 hours)
    const next21Hours = forecastList.slice(0, 7);
    
    const processed: DailyForecast[] = next21Hours.map((item) => {
      return {
        time: item.dt_txt ? item.dt_txt.split(' ')[1].substring(0, 5) : formatTime(item.dt),
        temp: formatTemp(item.main.temp),
        icon: getWeatherIcon(item.weather[0].icon, 100),
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
    
    // Find the forecast with the most common weather ID to get its icon
    const representativeForecast = forecasts.find(f => f.weather[0].id === mostCommonWeatherId);
    const iconCode = representativeForecast?.weather[0].icon || forecasts[0].weather[0].icon;
    const description = representativeForecast?.weather[0].description || forecasts[0].weather[0].description;
    
    return {
      day: formatDay(forecasts[0].dt),
      temp: formatTemp(avgTemp),
      icon: getWeatherIcon(iconCode, 50),
      description
    };
  });
  
  // limit to 7 days
  setWeeklyForecast(processedDays.slice(0, 7));
};

  // Handle refresh button click
  const handleRefresh = () => {
    if (city) {
      setLoading(true);
      setError(null);
      fetchWeatherByCity(city);
    }
  };

  // If no city and no error yet, show search prompt
  if (!city && !error) {
    return (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4"
        style={{ backgroundImage: `url(${backgroundImage})`  }}
      >
        <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 text-gray-900">
          <div className="flex flex-col items-center justify-center py-12">
            <Search size={48} className="mb-6 text-gray-700" />
            <h2 className="text-2xl font-medium mb-2 text-center">Search for a city</h2>
            <p className="text-center mb-4">
              Use the search bar above to find weather information for any city.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})`  }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 text-gray-900 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size={48} className="animate-spin mb-4" />
            <p>Getting city's weather data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 text-lg font-mono mb-4">{error}</p>
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
            <div className="bg-white rounded-2xl shadow-md p-6">
              {/* Temperature and Location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-7xl font-light">{currentWeather ? formatTemp(currentWeather.main.temp) : '-'}</h1>
                  {currentWeather && (
                    <span className="ml-4 text-5xl">
                      {getWeatherIcon(currentWeather.weather[0].icon, 50)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-semibold">{location?.name || '-'}</h2>
                  <p className="text-base text-gray-600">{location?.country || ''}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getCurrentDateTime(timezoneOffset)}
                  </p>
                </div>
              </div>

              {/* Description and Sun Times */}
              {currentWeather && currentWeather?.sys && (
                <div className="mt-6 flex flex-wrap items-center gap-4 text-gray-700 text-sm">
                  <span className="capitalize font-medium">{currentWeather.weather[0].description}</span>
                  <span className="font-semibold">Sunrise: {formatTime(currentWeather.sys.sunrise)}</span>
                  <span className="font-semibold">Sunset: {formatTime(currentWeather.sys.sunset)}</span>
                </div>
              )}

              {/* Extra Info */}
              {currentWeather && (
                <div className="mt-4 text-sm text-gray-600 font-medium">
                  Humidity: {currentWeather.main.humidity}% &bull; Feels like: {formatTemp(currentWeather.main.feels_like)}
                </div>
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
                    className="text-sm bg-yellow-200 flex items-center bg-opacity-20 hover:bg-opacity-30 px-3 py-2 px-3 rounded-full"
                    >
                  Refresh <RefreshCw className='w-5 h-5 ml-2 rounded-full' />
                </button>
              </div>

              {activeTab === 'day' ? (
                hourlyForecast.length > 0 ? (
                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {hourlyForecast.map((f, i) => (
                    <div key={i} className="bg-gray-200 hover:bg-yellow-200 p-4 rounded-lg text-center">
                      <div className="mb-2 text-gray-600">{f.icon}</div>
                      <div className="font-medium text-black">{f.temp}</div>
                      <div className="text-sm text-gray-600">{f.time}</div>
                    </div>
                  ))}
                </div>
                
                ) : (
                  <p className="text-center py-4">No hourly forecast available</p>
                )
              ) : weeklyForecast.length > 0 ? (
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-4 md:grid-cols-7 sm:gap-3">
                  {weeklyForecast.map((day, index) => (
                    <div key={index} className="flex justify-center">
                      <div className="bg-gray-50 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex flex-row sm:flex-col items-center justify-between sm:justify-center w-full">
                        <div className="text-lg font-medium sm:text-2xl md:text-3xl sm:font-light">{day.day}</div>
                           <div className="my-2">{day.icon}</div>
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
  );
};

export default SearchWeatherDashboard;