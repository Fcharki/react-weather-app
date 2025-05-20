import React, { useState } from 'react';
import { Cloud, Sun, CloudRain } from 'lucide-react';
import cloudy from '../assets/images/clouds.jpg';

const WeatherDashboard : React.FC = () => {
  const [activeTab, setActiveTab] = useState('day');
  
  // Sample forecast data - daily
  const ThreehourslyForecast = [
    { time: 'Now', temp: '18°', icon: <Cloud size={20} />, hour: '8:15' },
    { time: '9:00', temp: '18°', icon: <Cloud size={20} /> },
    { time: '12:00', temp: '20°', icon: <Cloud size={20} /> },
    { time: '15:00', temp: '24°', icon: <Cloud size={20} /> },
    { time: '18:00', temp: '25°', icon: <Sun size={20} /> },
    { time: '21:00', temp: '28°', icon: <Sun size={20} /> },
    { time: '00:00', temp: '28°', icon: <Sun size={20} /> },
  ];
  
  // Sample forecast data - weekly
  const weeklyForecast = [
    { day: 'Mon', temp: '4°', icon: <CloudRain size={24} /> },
    { day: 'Tue', temp: '15°', icon: <Sun size={24} /> },
    { day: 'Wed', temp: '6°', icon: <CloudRain size={24} /> },
    { day: 'Thu', temp: '11°', icon: <Cloud size={24} /> },
    { day: 'Fri', temp: '18°', icon: <Sun size={24} /> },
    { day: 'Sat', temp: '9°', icon: <CloudRain size={24} /> },
    { day: 'Sun', temp: '13°', icon: <Cloud size={24} /> }
  ];

  return (
    <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex justify-center items-center p-4"
            style={{ backgroundImage: `url(${cloudy})` }}>
      <div className="max-w-3xl rounded-3xl border border-white border-opacity-30 bg-transparent backdrop-blur-md p-6 text-gray-900">
        {/* Tab Selector */}
        <div className="flex justify-center mb-8 w-full">
          <div className="bg-white bg-opacity-30 rounded-full p-1 flex z-10">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'day' ? 'bg-white shadow-sm' : 'hover:bg-white hover:bg-opacity-20'}`}
              onClick={() => setActiveTab('day')}
            >
              Day
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'week' ? 'bg-white shadow-sm' : 'hover:bg-white hover:bg-opacity-20'}`}
              onClick={() => setActiveTab('week')}
            >
              Week
            </button>
          </div>
        </div>

        {/* Current Weather */}
        <div className="px-4 mb-8">
          <div className="flex items-baseline">
            <h1 className="text-7xl font-light">18°</h1>
            <div className="ml-4">
              <h2 className="text-3xl font-medium">Agadir</h2>
              <p className="text-lg text-gray-700">Morocco</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-700">
            <span>21:21 - Monday 19 May '25</span>
            <Cloud size={18} className="ml-2 mr-1" />
            <span>Cloudy</span>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="bg-white bg-opacity-30 rounded-xl p-4 w-full">
          <h3 className="text-lg font-medium mb-4">
            {activeTab === 'day' ? '24-hour forecast' : '7-day forecast'}
          </h3>
          
          {activeTab === 'day' ? (
            <div className="relative">
              {/* Temperature Graph */}
              <div className="h-16 relative mb-2">
                <svg viewBox="0 0 1000 100" className="w-full h-full">
                  <polyline
                    points="0,80 50,80 100,70 150,50 200,40 250,20 300,20 350,20 400,30 450,30 500,30 550,40 600,40 650,40 700,50 750,60 800,70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-600"
                  />
                  {ThreehourslyForecast.map((item, i) => (
                    <text 
                      key={i} 
                      x={i * (1000 / 17)} 
                      y={i % 2 === 0 ? 15 : 30} 
                      fontSize="12"
                      textAnchor="middle"
                      className="text-xs"
                    >
                      {item.temp}
                    </text>
                  ))}
                </svg>
              </div>
              
              {/* Weather Icons */}
              <div className="flex justify-between mb-2">
                {ThreehourslyForecast.map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-gray-600">
                      {item.icon}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Hours */}
              <div className="flex justify-between text-xs text-gray-600">
                {ThreehourslyForecast.map((item, i) => (
                  <div key={i} className="text-center">
                    {item.time}
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};


export default WeatherDashboard;