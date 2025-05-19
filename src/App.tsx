import './App.css';
import { useState } from 'react';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import WeatherCard from './components/WeatherCard';
import { fetchWeather } from './services/weather';
import { type WeatherData } from './components/types/weatherDataTypes';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await fetchWeather(city);
      setData(result);
      
    } catch (err) {
      setError('City not found');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <SearchBar value={city} onChange={(e) => setCity(e.target.value)} onSubmit={handleSearch} />
      {loading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {data && <WeatherCard data={data} />}
    </div>
  );
}

export default App;
