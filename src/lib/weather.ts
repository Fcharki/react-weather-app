import type {
  CurrentWeather,
  ForecastEntry,
  ForecastItem,
  WeatherCondition,
} from '../types/weather';

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC',
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
};

const cityDate = (timestamp: number, timezoneOffset = 0): Date =>
  new Date((timestamp + timezoneOffset) * 1000);

const currentCityDate = (timezoneOffset = 0): Date =>
  new Date(Date.now() + timezoneOffset * 1000);

export const formatTemp = (temp: number): string => `${Math.round(temp)}°`;

export const formatTime = (timestamp: number, timezoneOffset = 0): string =>
  cityDate(timestamp, timezoneOffset).toLocaleTimeString('en-US', TIME_OPTIONS);

export const formatDay = (timestamp: number, timezoneOffset = 0): string =>
  cityDate(timestamp, timezoneOffset).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });

export const formatShortDate = (timezoneOffset = 0): string =>
  currentCityDate(timezoneOffset).toLocaleDateString('en-US', DATE_OPTIONS);

export const formatCurrentDateTime = (timezoneOffset = 0): string => {
  const now = currentCityDate(timezoneOffset);
  const time = now.toLocaleTimeString('en-US', TIME_OPTIONS);
  const date = now.toLocaleDateString('en-US', { ...DATE_OPTIONS, year: '2-digit' });
  return `${time} - ${date}`;
};

export const getWeatherIconUrl = (iconCode: string): string =>
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

const primaryCondition = (item: CurrentWeather | ForecastItem): WeatherCondition | undefined =>
  item.weather[0];

export const buildHourlyForecast = (
  current: CurrentWeather,
  forecast: ForecastItem[],
  timezoneOffset: number
): ForecastEntry[] => {
  const currentCondition = primaryCondition(current);
  const entries: ForecastEntry[] = currentCondition
    ? [
        {
          label: 'Now',
          temp: current.main.temp,
          icon: currentCondition.icon,
          description: currentCondition.description,
        },
      ]
    : [];

  const upcoming = forecast.filter((item) => item.dt > current.dt && item.weather.length > 0);

  for (const item of upcoming) {
    if (entries.length >= 7) break;
    const condition = primaryCondition(item);
    if (!condition) continue;

    entries.push({
      label: formatTime(item.dt, timezoneOffset),
      temp: item.main.temp,
      icon: condition.icon,
      description: condition.description,
    });
  }

  return entries;
};

export const buildWeeklyForecast = (
  forecast: ForecastItem[],
  timezoneOffset: number
): ForecastEntry[] => {
  const groupedForecasts = new Map<string, ForecastItem[]>();

  forecast.forEach((item) => {
    if (item.weather.length === 0) return;

    const dateKey = cityDate(item.dt, timezoneOffset).toISOString().slice(0, 10);
    const items = groupedForecasts.get(dateKey);

    if (items) {
      items.push(item);
    } else {
      groupedForecasts.set(dateKey, [item]);
    }
  });

  return Array.from(groupedForecasts.values())
    .slice(0, 7)
    .map((items) => {
      const averageTemp =
        items.reduce((total, item) => total + item.main.temp, 0) / items.length;

      const conditionCounts = new Map<number, number>();
      items.forEach((item) => {
        const conditionId = item.weather[0].id;
        conditionCounts.set(conditionId, (conditionCounts.get(conditionId) ?? 0) + 1);
      });

      let representativeCondition = items[0].weather[0];
      let highestCount = 0;

      conditionCounts.forEach((count, conditionId) => {
        if (count > highestCount) {
          highestCount = count;
          const match = items.find((item) => item.weather[0].id === conditionId);
          if (match) representativeCondition = match.weather[0];
        }
      });

      return {
        label: formatDay(items[0].dt, timezoneOffset),
        temp: averageTemp,
        icon: representativeCondition.icon,
        description: representativeCondition.description,
      };
    });
};
