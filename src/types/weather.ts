export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherCondition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type WeatherMeasurements = {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure?: number;
};

export type CurrentWeather = {
  dt: number;
  name: string;
  timezone: number;
  coord: {
    lat: number;
    lon: number;
  };
  main: WeatherMeasurements;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: WeatherCondition[];
};

export type ForecastItem = {
  dt: number;
  dt_txt?: string;
  main: WeatherMeasurements;
  weather: WeatherCondition[];
};

export type WeatherLocation = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: number;
};

export type WeatherSnapshot = {
  current: CurrentWeather;
  forecast: ForecastItem[];
  location: WeatherLocation;
};

export type CitySuggestion = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

export type ForecastEntry = {
  label: string;
  temp: number;
  icon: string;
  description: string;
};

export type WeatherQuery = {
  city?: string;
  coordinates?: Coordinates;
};

export type WeatherDashboardProps = WeatherQuery & {
  isLoadingLocation?: boolean;
};
