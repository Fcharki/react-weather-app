import React, { useState, useEffect } from 'react';
import { Droplet, Loader, RefreshCw, Sunrise, Sunset, Thermometer } from 'lucide-react';
import { type WeatherDashboardProps, type WeatherLocation, type WeatherForecastItem, type DailyForecast, type WeeklyForecastItem
}                                                                                                from './types/weatherDataTypes';
import { fetchWeatherByCoordinates as getWeatherData, fetchWeatherForecast as getForecastData } from '../services/weather.ts';

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

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ coordinates, isLoading: forcedLoading }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState<boolean>(!!forcedLoading);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherForecastItem | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<DailyForecast[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecastItem[]>([]);


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

  // icon logic
const getWeatherIcon = (iconCode: string, size = 48): React.JSX.Element => {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return <img src={iconUrl} alt="weather icon" width={size} height={size} />;
};


  const formatTemp = (temp: number): string => `${Math.round(temp)}°`;
  const formatTime = (ts: number): string => new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, });
  const formatDay = (ts: number): string => new Date(ts * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  const getCurrentDateTime = (): string => {
    const now = new Date();
    return `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true,  })} - ${now.toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'short', year: '2-digit'
    })}`;
  };

  useEffect(() => {
    if (forcedLoading) {
      setLoading(true);
      return;
    }

    if (coordinates) {
      fetchData(coordinates.latitude, coordinates.longitude);
    }
  }, [coordinates, forcedLoading]);

  const fetchData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      const { currentWeather, location } = await getWeatherData(lat, lon);
      const forecastList = await getForecastData(lat, lon);

      setCurrentWeather(currentWeather);
      setLocation(location);
      processHourlyForecast(forecastList);
      processWeeklyForecast(forecastList);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const processHourlyForecast = (forecastList: WeatherForecastItem[]) => {
    const next7 = forecastList.slice(0, 7).map((item, index) => ({
      time: index === 0 ? 'Now' : (item.dt_txt ? item.dt_txt.split(' ')[1].substring(0, 5) : formatTime(item.dt)),
      temp: formatTemp(item.main.temp),
      icon:  getWeatherIcon(item.weather[0].icon, 50),
      description: item.weather[0].description

    }));
    setHourlyForecast(next7);

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

  const handleRefresh = () => {
    if (coordinates) fetchData(coordinates.latitude, coordinates.longitude);
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})`  }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 text-gray-900 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size={48} className="animate-spin mb-4" />
            <p>Loading weather data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={handleRefresh} className="px-4 py-2 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-full">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
              <div className="bg-white bg-opacity-30 rounded-full p-1 flex z-10">
                {['day', 'week'].map(tab => (
                  <button
                    key={tab}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab ? 'bg-white shadow-sm' : 'hover:bg-white hover:bg-opacity-20'
                    }`}
                    onClick={() => setActiveTab(tab as 'day' | 'week')}
                  >
                    {tab === 'day' ? 'Day' : 'Week'}
                  </button>
                ))}
              </div>
            </div>
              {/* Current Weather */}
              <div className="px-4 mb-8">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  {/* Temperature and Location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h1 className="text-7xl font-light">
                        {currentWeather ? formatTemp(currentWeather.main.temp) : '-'}
                      </h1>
                      {currentWeather && (
                        <span className="ml-4 text-5xl">
                          {getWeatherIcon(currentWeather.weather[0].icon, 48)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-semibold">{location?.name || '-'}</h2>
                      <p className="text-base text-gray-600">{location?.country || ''}</p>
                      <p className="text-sm text-gray-500 mt-1">{getCurrentDateTime()}</p>
                    </div>
                  </div>

                  {/* Description and Sun Times */}
                  {currentWeather && currentWeather?.sys && (
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-gray-700 text-sm">
                      <span className="capitalize font-medium">{currentWeather.weather[0].description}</span>
                      <div className="flex items-center gap-1">
                        <Sunrise className="w-4 h-4 text-orange-400" />
                        <span className="font-semibold">Sunrise: {formatTime(currentWeather.sys.sunrise)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sunset className="w-4 h-4 text-blue-800" />
                        <span className="font-semibold">Sunset: {formatTime(currentWeather.sys.sunset)}</span>
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
                        <Thermometer className="w-4 h-4 text-orange-300" />
                        <span>Feels like: {formatTemp(currentWeather.main.feels_like)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>


            {/* Forecast */}
            <div className="bg-white bg-opacity-30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{activeTab === 'day' ? '24-hour forecast' : '7-day forecast'}</h3>
                <button
                  onClick={handleRefresh}
                  className="text-sm bg-yellow-200 flex items-center bg-opacity-20 hover:bg-opacity-30 px-3 py-2 px-3 rounded-full"
                >
                 Refresh <RefreshCw className='w-5 h-5 ml-2 rounded-full' />
                </button>
              </div>

              {activeTab === 'day' ? (
                hourlyForecast.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {hourlyForecast.map((f, i) => (
                    <div key={i} className="bg-gray-100 hover:bg-yellow-200 p-4 rounded-lg text-center">
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
  );
};

export default WeatherDashboard;
