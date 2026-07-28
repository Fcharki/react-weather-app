import { useState } from 'react';
import WeatherNavBar from './components/NavBar';
import WeatherDashboard from './components/DefaultWeatherDashboard';
import SearchWeatherDashboard from './components/SearchResultDashbaord';
import About from './components/About';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Default location: Agadir, Morocco
const DEFAULT_COORDINATES: Coordinates = {
  latitude: 30.4278,
  longitude: -9.5981,
};

const App = () => {
  const [searchCity, setSearchCity] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSearch = (city: string) => {
    setSearchCity(city);
  };

  // called when user explicitly clicks "Use my location"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setSearchCity(''); // clear any active search so location weather shows
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to access your location.');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  };

  // which component to render for the home route
  const renderWeatherComponent = () => {
    if (searchCity) {
      return <SearchWeatherDashboard city={searchCity} />;
    }
    return <WeatherDashboard coordinates={coordinates} isLoading={isLoadingLocation} />;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 parent">
        <WeatherNavBar
          onSearch={handleSearch}
          onUseMyLocation={handleUseMyLocation}
          locationError={locationError}
        />
        <div className="flex-1">
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/" element={renderWeatherComponent()} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;