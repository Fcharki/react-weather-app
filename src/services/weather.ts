const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const fetchWeather = async (city: string) => {
  const res = await fetch(
    `${BASE_URL}/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );

  const data = await res.json();

  if (data.cod !== 200) {
    throw new Error(data.message); 
  }

  return data; 
};
