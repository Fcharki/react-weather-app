import type { ReactNode } from 'react';
import { Droplet, MapPin, Sunrise, Sunset, Thermometer } from 'lucide-react';
import type { CurrentWeather, WeatherLocation } from '../../types/weather';
import {
  formatCurrentDateTime,
  formatShortDate,
  formatTemp,
  formatTime,
} from '../../lib/weather';
import WeatherIcon from './WeatherIcon';

type CurrentWeatherCardProps = {
  current: CurrentWeather;
  location: WeatherLocation;
};

type StatTileProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

const StatTile = ({ icon, label, value }: StatTileProps) => (
  <div className="rounded-xl bg-white/70 px-3 py-2.5 sm:bg-gray-50">
    <dt className="flex items-center gap-1.5 text-xs text-gray-500">
      {icon}
      <span>{label}</span>
    </dt>
    <dd className="mt-0.5 text-sm font-semibold text-gray-900">{value}</dd>
  </div>
);

const CurrentWeatherCard = ({ current, location }: CurrentWeatherCardProps) => {
  const condition = current.weather[0];
  const timezone = location.timezone;

  return (
    <section className="rounded-3xl border border-white/50 bg-white/80 p-5 text-gray-900 shadow-lg backdrop-blur-md sm:border-white/30 sm:bg-white/90 sm:p-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="order-2 flex items-center gap-3 sm:order-1">
          <WeatherIcon
            iconCode={condition?.icon}
            size={72}
            alt={condition?.description ?? 'Current weather'}
            priority
            className="h-16 w-16 drop-shadow-lg sm:h-[72px] sm:w-[72px]"
          />
          <div>
            <h1 className="text-6xl font-thin tracking-tight sm:text-7xl">
              {formatTemp(current.main.temp)}
            </h1>
            <p className="text-sm capitalize text-gray-700 sm:text-base">
              {condition?.description ?? 'Current conditions'}
            </p>
          </div>
        </div>

        <div className="order-1 sm:order-2 sm:text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {formatShortDate(timezone)}
          </p>
          <div className="mt-1 flex items-center justify-center gap-1.5 sm:justify-end">
            <MapPin className="h-4 w-4 text-gray-600" aria-hidden="true" />
            <h2 className="text-xl font-semibold sm:text-2xl">{location.name}</h2>
          </div>
          <p className="text-xs text-gray-500">{location.country}</p>
          <p className="mt-1 hidden text-sm text-gray-500 sm:block">
            {formatCurrentDateTime(timezone)}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <StatTile
          icon={<Droplet className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />}
          label="Humidity"
          value={`${current.main.humidity}%`}
        />
        <StatTile
          icon={<Thermometer className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />}
          label="Feels like"
          value={formatTemp(current.main.feels_like)}
        />
        <StatTile
          icon={<Sunrise className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />}
          label="Sunrise"
          value={formatTime(current.sys.sunrise, timezone)}
        />
        <StatTile
          icon={<Sunset className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />}
          label="Sunset"
          value={formatTime(current.sys.sunset, timezone)}
        />
      </dl>
    </section>
  );
};

export default CurrentWeatherCard;
