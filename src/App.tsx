import { useState, useEffect } from 'react';
import WeatherNavBar from './components/NavBar';
import WeatherDashboard from './components/DefaultWeatherDashboard';
import SearchWeatherDashboard from './components/SearchResultDashbaord';
import './App.css';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const App = () => {
  const [searchCity, setSearchCity] = useState<string>('');
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const handleSearch = (city: string) => {
    setSearchCity(city);
  };

  // get user's geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLoadingLocation(false);
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to access your location. You can search for a city instead.');
          setIsLoadingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser. Please search for a city.');
      setIsLoadingLocation(false);
    }
  }, []);

  // which component to render
  const renderWeatherComponent = () => {
    // If user has searched for a city, show search results
    if (searchCity) {
      return <SearchWeatherDashboard city={searchCity} />;
    }
    
    // if user location is enabled, show loading in WeatherDashboard
    if (isLoadingLocation) {
      return <WeatherDashboard isLoading={true} />;
    }
    
    // if we have user's coordinates, show their weather
    if (userCoordinates) {
      return <WeatherDashboard coordinates={userCoordinates} />;
    }
    
    // if there was an error getting location and no search,
    return <SearchWeatherDashboard locationError={locationError} />;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 parent">
      <WeatherNavBar onSearch={handleSearch} />
      <div className="pt-32"> 
        {renderWeatherComponent()}
      </div>
    </div>
  );
};

export default App;