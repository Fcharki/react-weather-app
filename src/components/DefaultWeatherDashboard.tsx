import React, { useState, useEffect } from 'react';
import {
  Cloud, Sun, CloudRain, CloudLightning, CloudFog, CloudDrizzle, Loader, RefreshCw
} from 'lucide-react';
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
  const getWeatherIcon = (code: number, size = 24): React.JSX.Element => {
    if (code >= 200 && code < 300) return <CloudLightning size={size} />;
    if (code >= 300 && code < 400) return <CloudDrizzle size={size} />;
    if (code >= 500 && code < 600) return <CloudRain size={size} />;
    if (code >= 600 && code < 700) return <CloudRain size={size} />;
    if (code >= 700 && code < 800) return <CloudFog size={size} />;
    if (code === 800) return <Sun size={size} />;
    return <Cloud size={size} />;
  };

  const formatTemp = (temp: number): string => `${Math.round(temp)}°`;
  const formatTime = (ts: number): string => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDay = (ts: number): string => new Date(ts * 1000).toLocaleDateString([], { weekday: 'short' });
  const getCurrentDateTime = (): string => {
    const now = new Date();
    return `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${now.toLocaleDateString([], {
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
      icon: getWeatherIcon(item.weather[0].id, 20),
      description: item.weather[0].description
    }));
    setHourlyForecast(next7);
  };

  const processWeeklyForecast = (forecastList: WeatherForecastItem[]) => {
    const grouped: Record<string, WeatherForecastItem[]> = {};

    forecastList.forEach(item => {
      const key = new Date(item.dt * 1000).toISOString().split('T')[0];
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
    });

    const weekly: WeeklyForecastItem[] = Object.values(grouped).map(dayItems => {
      const avgTemp = dayItems.reduce((acc, item) => acc + item.main.temp, 0) / dayItems.length;

      const weatherCount: Record<number, number> = {};
      dayItems.forEach(item => {
        const id = item.weather[0].id;
        weatherCount[id] = (weatherCount[id] || 0) + 1;
      });

      const [mostCommonIdStr] = Object.entries(weatherCount).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ["0", 0] // Use string type for the key
      );

      const mostCommonId = Number(mostCommonIdStr);

      const commonDesc = dayItems.find(f => f.weather[0].id === Number(mostCommonId))?.weather[0].description || '';

      return {
        day: formatDay(dayItems[0].dt),
        temp: formatTemp(avgTemp),
        icon: getWeatherIcon(Number(mostCommonId), 24),
        description: commonDesc
      };
    });

    setWeeklyForecast(weekly.slice(0, 7));
  };

  const handleRefresh = () => {
    if (coordinates) fetchData(coordinates.latitude, coordinates.longitude);
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})`  }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 text-gray-900">
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
              <div className="flex items-baseline">
                <h1 className="text-7xl font-light">{currentWeather ? formatTemp(currentWeather.main.temp) : '-'}</h1>
                <div className="ml-4">
                  <h2 className="text-3xl font-medium">{location?.name || 'Unknown'}</h2>
                  <p className="text-lg text-gray-700">{location?.country || ''}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-700">
                <span>{getCurrentDateTime()}</span>
                {currentWeather && (
                  <>
                    <span className="ml-2 mr-1">{getWeatherIcon(currentWeather.weather[0].id, 18)}</span>
                    <span className="capitalize">{currentWeather.weather[0].description}</span>
                  </>
                )}
              </div>
              {currentWeather && (
                <div className="mt-2 text-sm text-gray-700">
                  Humidity: {currentWeather.main.humidity}% • Feels like: {formatTemp(currentWeather.main.feels_like)}
                </div>
              )}
            </div>

            {/* Forecast */}
            <div className="bg-white bg-opacity-30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{activeTab === 'day' ? '24-hour forecast' : '7-day forecast'}</h3>
                <button
                  onClick={handleRefresh}
                  className="text-sm flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full"
                >
                  <RefreshCw className='w-5 h-5 rounded-full' />
                </button>
              </div>

              {activeTab === 'day' ? (
                hourlyForecast.length ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">{hourlyForecast.map((f, i) => <div key={i}>{f.icon}</div>)}</div>
                    <div className="flex justify-between font-medium">{hourlyForecast.map((f, i) => <div key={i}>{f.temp}</div>)}</div>
                    <div className="flex justify-between text-xs text-gray-600">{hourlyForecast.map((f, i) => <div key={i}>{f.time}</div>)}</div>
                  </div>
                ) : (
                  <p className="text-center py-4">No hourly forecast available</p>
                )
              ) : weeklyForecast.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {weeklyForecast.map((day, i) => (
                    <div key={i} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center">
                      <div className="text-lg sm:text-2xl">{day.day}</div>
                      <div className="my-2">{day.icon}</div>
                      <div className="text-xl font-medium">{day.temp}</div>
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
