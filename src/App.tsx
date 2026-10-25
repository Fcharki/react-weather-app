import { lazy, Suspense, useCallback, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import WeatherNavBar from './components/NavBar';
import WeatherDashboard from './components/weather/WeatherDashboard';
import type { Coordinates } from './types/weather';

const About = lazy(() => import('./components/About'));

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 30.4278,
  longitude: -9.5981,
};

const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. Search for a city instead.';
    case error.POSITION_UNAVAILABLE:
      return 'Your location is currently unavailable.';
    case error.TIMEOUT:
      return 'Getting your location took too long. Please try again.';
    default:
      return 'Unable to access your location.';
  }
};

const App = () => {
  const [searchCity, setSearchCity] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSearch = useCallback((city: string) => {
    setSearchCity(city);
    setLocationError(null);
  }, []);

  const handleUseMyLocation = useCallback(() => {
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
        setSearchCity('');
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error));
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      }
    );
  }, []);

  return (
    <Router>
      <div className="parent flex min-h-dvh flex-col bg-gray-100 dark:bg-gray-900">
        <WeatherNavBar
          onSearch={handleSearch}
          onUseMyLocation={handleUseMyLocation}
          locationError={locationError}
          isLocating={isLoadingLocation}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/about"
              element={
                <Suspense
                  fallback={
                    <div className="flex min-h-[60vh] items-center justify-center pt-28 text-gray-500 dark:text-gray-400">
                      Loading...
                    </div>
                  }
                >
                  <About />
                </Suspense>
              }
            />
            <Route
              path="/"
              element={
                <WeatherDashboard
                  city={searchCity || undefined}
                  coordinates={coordinates}
                  isLoadingLocation={isLoadingLocation}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
