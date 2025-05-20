//TODO :  ORGANIZE CODE HERE ..............................................................

//* TYPES
// types for weather data
export type WeatherLocation = {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export type WeatherForecastItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  dt_txt?: string;
}

export type DailyForecast = {
  time: string;
  temp: string;
  icon: React.JSX.Element;
  description: string;
}

export type WeeklyForecastItem = {
  day: string;
  temp: string;
  icon: React.JSX.Element;
  description: string;
}

export type WeatherDashboardProps = {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isLoading?: boolean;
}

//* FUCNTIONS AS SERVICES 


//* ETC ....