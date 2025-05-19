import React from 'react';
import { type WeatherData } from './types/weatherDataTypes';


type WeatherCardProps = {
  data: WeatherData;
};

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  return (
    <div className="mt-4 p-4 bg-blue-100 rounded-lg">
      <h2 className="text-lg font-bold">
        {data.name}, {data.sys.country}
      </h2>
      <p>{data.weather[0].description}</p>
      <p>Temp: {data.main.temp}°C</p>
      <p>Humidity: {data.main.humidity}%</p>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt="weather icon"
      />
    </div>
  );
};

export default WeatherCard;