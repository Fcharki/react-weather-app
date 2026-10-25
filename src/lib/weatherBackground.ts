import clearNight from '../assets/images/clear-night.webp';
import cloudsNight from '../assets/images/clouds-night.webp';
import drizzleNight from '../assets/images/drizzle-night.webp';
import dustNight from '../assets/images/dust-night.webp';
import mistNight from '../assets/images/mist-night.webp';
import rainNight from '../assets/images/rain-night.webp';
import snowyNight from '../assets/images/snowy-night.webp';
import thunderNight from '../assets/images/thunder-night.webp';
import thunderstormNight from '../assets/images/thunderstorm-night.webp';
import tornadoNight from '../assets/images/tornado-night.webp';
import windyNight from '../assets/images/windy-night.webp';
import cloudy from '../assets/images/clouds.webp';
import sunny from '../assets/images/sunny.webp';
import rainy from '../assets/images/rain.webp';
import mist from '../assets/images/mist.webp';
import dust from '../assets/images/dust.webp';
import snowy from '../assets/images/snowy.webp';
import thunder from '../assets/images/thunder.webp';
import tornado from '../assets/images/tornado.webp';
import thunderstorm from '../assets/images/thunderstorm.webp';
import drizzle from '../assets/images/drizzle.webp';
import windy from '../assets/images/windy.webp';
import type { CurrentWeather } from '../types/weather';

export const backgroundImageMap = {
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
} as const;

export const nightBackgroundImageMap = {
  sunny: clearNight,
  rainy: rainNight,
  snowy: snowyNight,
  thunder: thunderNight,
  thunderstorm: thunderstormNight,
  drizzle: drizzleNight,
  mist: mistNight,
  dust: dustNight,
  tornado: tornadoNight,
  windy: windyNight,
  cloudy: cloudsNight,
} as const;

export type BackgroundCondition = keyof typeof backgroundImageMap;

export const normalizeWeatherCondition = (description: string): BackgroundCondition => {
  const normalized = description.toLowerCase();

  if (normalized.includes('thunder')) return 'thunderstorm';
  if (normalized.includes('drizzle')) return 'drizzle';
  if (normalized.includes('snow') || normalized.includes('sleet')) return 'snowy';
  if (normalized.includes('rain') || normalized.includes('shower')) return 'rainy';
  if (normalized.includes('dust') || normalized.includes('sand') || normalized.includes('ash')) return 'dust';
  if (normalized.includes('tornado')) return 'tornado';
  if (normalized.includes('wind') || normalized.includes('squall')) return 'windy';
  if (
    normalized.includes('mist') ||
    normalized.includes('fog') ||
    normalized.includes('haze') ||
    normalized.includes('smoke')
  ) {
    return 'mist';
  }
  if (normalized.includes('cloud') || normalized.includes('overcast')) return 'cloudy';
  if (normalized.includes('clear') || normalized.includes('sun')) return 'sunny';

  return 'cloudy';
};

export const isNightWeather = (current: CurrentWeather): boolean => {
  const icon = current.weather[0]?.icon;
  if (icon) return icon.endsWith('n');

  return current.dt < current.sys.sunrise || current.dt >= current.sys.sunset;
};

export const getWeatherBackground = (description: string, isNight: boolean): string => {
  const condition = normalizeWeatherCondition(description);
  return (isNight ? nightBackgroundImageMap : backgroundImageMap)[condition];
};
