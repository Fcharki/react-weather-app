import React, { useState, useEffect } from 'react';
import { Loader, Search, RefreshCw, Sunrise, Sunset, Droplet, Thermometer, MapPin } from 'lucide-react';
import { type WeatherLocation, type WeatherForecastItem, type DailyForecast, type WeeklyForecastItem 
                                                                 } from './types/weatherDataTypes';
import { backgroundImageMap } from './backgroundImageMap';
import { normalizeWeatherCondition } from './backgroundImageMap';                                                            
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

  // Fixed time formatting function
  const formatTime = (timestamp: number, timezoneOffsetSeconds?: number): string => {
    if (timezoneOffsetSeconds !== undefined) {
      // Apply timezone offset for specific city times (sunrise/sunset)
      const adjustedTimestamp = (timestamp + timezoneOffsetSeconds) * 1000;
      const date = new Date(adjustedTimestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'UTC' // Use UTC since we already applied the offset
      });
    } else {
      // For regular timestamps, use local formatting
      return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  };


  const formatDay = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };


  // Fixed current date/time function
  const getCurrentDateTime = (timezoneOffsetSeconds: number): string => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (timezoneOffsetSeconds * 1000));
    
    const time = cityTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const date = cityTime.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: '2-digit'
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
        <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 mt-8 text-gray-900">
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
    className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    {/* Desktop Layout + Mobile Landscape */}
    <div className="hidden sm:flex portrait:hidden mt-8 landscape:flex min-h-screen items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-4 sm:p-6 text-gray-900 max-h-[95vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Loader size={48} className="animate-spin mb-4" />
            <p>Getting city's weather data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <p className="text-red-600 text-lg font-mono mb-4">{error}</p>
            {/* <button onClick={handleRefresh} className="px-4 py-2 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-full">
              Try Again
            </button> */}
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
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
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-md p-6">
                {/* Temperature and Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h1 className="text-7xl font-light">
                      {currentWeather ? formatTemp(currentWeather.main.temp) : '-'}
                    </h1>
                    {currentWeather && (
                      <span className="ml-4 text-5xl">
                        {getWeatherIcon(currentWeather.weather[0].icon, 50)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <MapPin className="w-6 h-6 text-gray-700" />
                      <h2 className="text-2xl font-semibold">
                        {location?.name || '-'}
                      </h2>
                    </div>
                    <p className="text-base text-gray-600">{location?.country || ''}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCurrentDateTime(timezoneOffset)}
                    </p>
                  </div>
                </div>

                {/* Description and Sun Times */}
                {currentWeather?.sys && (
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-gray-700 text-sm">
                    <span className="capitalize font-medium">
                      {currentWeather.weather[0].description}
                    </span>
                    <div className="flex items-center gap-1">
                      <Sunrise className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold">Sunrise: {formatTime(currentWeather.sys.sunrise, timezoneOffset)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sunset className="w-4 h-4 text-blue-800" />
                      <span className="font-semibold">Sunset: {formatTime(currentWeather.sys.sunset, timezoneOffset)}</span>
                    </div>
                  </div>
                )}

                {/* Extra Info */}
                {currentWeather && (
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      <span>Humidity: {currentWeather.main.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span>Feels like: {formatTemp(currentWeather.main.feels_like)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-white bg-opacity-30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {activeTab === 'day' ? '24-hour forecast' : '7-day forecast'}
                </h3>
                <button
                  onClick={handleRefresh}
                  className="text-sm bg-yellow-200 flex items-center bg-opacity-20 hover:bg-opacity-30 hover:bg-yellow-300 px-3 py-2 rounded-full"
                >
                  Refresh <RefreshCw className='w-5 h-5 ml-2 rounded-full' />
                </button>
              </div>

              {activeTab === 'day' ? (
                hourlyForecast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {hourlyForecast.map((f, i) => (
                      <div key={i} className="bg-gray-200 hover:bg-yellow-200 p-3 rounded-lg text-center">
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
                      <div className="bg-gray-50 hover:bg-yellow-200 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex flex-row sm:flex-col items-center justify-between sm:justify-center w-full">
                        <div className="text-lg font-medium sm:text-xl md:text-2xl">{day.day}</div>
                        <div className="my-2">{day.icon}</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-medium">{day.temp}</div>
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

    {/* Mobile Portrait Layout - Full Screen Native App Style */}
    <div className="sm:hidden portrait:flex landscape:hidden w-full flex-col h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-y-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader size={48} className="animate-spin mb-4 text-white" />
          <p className="text-white">Getting city's weather data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-400 text-lg font-mono mb-4 text-center px-4">{error}</p>
          <button onClick={handleRefresh} className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Header with Current Weather */}
          <div className="flex-shrink-0 pt-16 pb-6 px-6 text-center text-white mt-28">
            <h2 className="text-2xl mb-2">{location?.name || '-'}</h2>
            <p className="text-sm opacity-80 mb-6">{location?.country || ''}</p>
            
            <div className="flex items-center justify-center mb-4">
              {currentWeather && (
                <span className="text-6xl mr-4">
                  {getWeatherIcon(currentWeather.weather[0].icon, 64)}
                </span>
              )}
              <h1 className="text-6xl font-thin">
                {currentWeather ? formatTemp(currentWeather.main.temp) : '-'}
              </h1>
            </div>
            
            {currentWeather && (
              <p className="text-lg capitalize mb-6 opacity-90">
                {currentWeather.weather[0].description}
              </p>
            )}

            {/* Quick Stats Row */}
            {currentWeather && (
              <div className="flex justify-center space-x-8 text-sm">
                <div className="text-center">
                  <Droplet className="w-4 h-4 mx-auto mb-1 opacity-80" />
                  <p>{currentWeather.main.humidity}%</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-4 h-4 mx-auto mb-1 opacity-80" />
                  <p>{formatTemp(currentWeather.main.feels_like)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex-shrink-0 px-6 mb-4">
            <div className="bg-gray-900 bg-opacity-30 rounded-full p-1 flex">
              <button
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'day' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
                onClick={() => setActiveTab('day')}
              >
                24 Hours
              </button>
              <button
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'week' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
                onClick={() => setActiveTab('week')}
              >
                7 Days
              </button>
            </div>
          </div>

          {/* Mobile Forecast Content */}
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="bg-gray-900 bg-opacity-20 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  {activeTab === 'day' ? 'Hourly Forecast' : 'Daily Forecast'}
                </h3>
                <button
                  onClick={handleRefresh}
                  className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-full text-gray-800 flex items-center gap-2"
                >
                  Refresh <RefreshCw className='w-4 h-4' />
                </button>
              </div>

              {activeTab === 'day' ? (
                hourlyForecast.length > 0 ? (
                  <div className="space-y-3">
                    {hourlyForecast.slice(0, 6).map((f, i) => (
                      <div key={i} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                        <div className="text-gray-800 font-medium">{f.time}</div>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{f.icon}</div>
                          <div className="text-gray-800 font-medium text-lg">{f.temp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-400">No hourly forecast available</p>
                )
              ) : weeklyForecast.length > 0 ? (
                <div className="space-y-3">
                  {weeklyForecast.map((day, index) => (
                    <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                      <div className="text-gray-800 font-medium">{day.day}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{day.icon}</div>
                        <div className="text-gray-800 font-medium text-lg">{day.temp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-400">No weekly forecast available</p>
              )}
            </div>

            {/* Weather Details */}
            {currentWeather && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-900 bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Droplet className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">HUMIDITY</span>
                  </div>
                  <div className="text-2xl font-light text-white">{currentWeather.main.humidity}%</div>
                </div>
                
                <div className="bg-gray-900 bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">FEELS LIKE</span>
                  </div>
                  <div className="text-2xl font-light text-white">{formatTemp(currentWeather.main.feels_like)}</div>
                </div>
              </div>
            )}

            {/* Additional Info Section for Mobile */}
            {currentWeather?.sys && (
              <div className="mt-4 bg-gray-900 bg-opacity-20 rounded-2xl p-4">
                <h4 className="text-white font-medium mb-3">Sun & Moon</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Sunrise className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-white text-sm">Sunrise</p>
                      <p className="text-white opacity-80 text-xs">{formatTime(currentWeather.sys.sunrise, timezoneOffset)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sunset className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white text-sm">Sunset</p>
                      <p className="text-white opacity-80 text-xs">{formatTime(currentWeather.sys.sunset, timezoneOffset)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
);
};

export default SearchWeatherDashboard;