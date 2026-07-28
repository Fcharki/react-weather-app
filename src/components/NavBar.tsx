import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Link } from "react-router-dom";
// import { ChevronDownIcon } from '@heroicons/react/20/solid'; //  to add when needed
import { Dialog } from '@headlessui/react'; // Disclosure, to add when needed
import logo from '../assets/images/sun-logo.png';
import { type Suggestion } from './types/weatherDataTypes';

interface WeatherNavBarProps {
  onSearch?: (city: string) => void;
  onUseMyLocation?: () => void;
  locationError?: string | null;
}

const WeatherNavBar: React.FC<WeatherNavBarProps> = ({ onSearch, onUseMyLocation, locationError }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Separate outside-click refs per rendered instance (desktop / mobile bar / mobile menu)
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileBarContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuContainerRef = useRef<HTMLDivElement>(null);

  // hide history dropdown on outside click (checks all three containers)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopContainerRef.current?.contains(target);
      const insideMobileBar = mobileBarContainerRef.current?.contains(target);
      const insideMobileMenu = mobileMenuContainerRef.current?.contains(target);

      if (!insideDesktop && !insideMobileBar && !insideMobileMenu) {
        setShowSearchHistory(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // load history on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (history.length === 0) {
      setShowSearchHistory(false);
    }
    setSearchHistory(history);
  }, []);

  // save a new search
  const addToSearchHistory = (city: string) => {
    setSearchHistory((prev) => {
      const updated = [city, ...prev.filter((c) => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
      addToSearchHistory(searchQuery.trim());
      setShowDropdown(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.openweathermap.org';
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    if (!query.trim()) return;
    const response = await fetch(
      `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );
    const data = await response.json();
    setSuggestions(data);
  };

  const selectCity = (city: string) => {
    setSearchQuery(city);
    setShowDropdown(false);
    setShowSearchHistory(false);
    onSearch?.(city);
    addToSearchHistory(city);
  };

  // Shared search form + dropdown, reused for desktop, mobile bar, and mobile menu.
  // `instanceId` keeps React keys stable and unique per render location.
  const renderSearchForm = (instanceId: string, containerRef: React.RefObject<HTMLDivElement | null>) => (
    <div className="relative flex-1" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            setShowDropdown(true);

            if (debounceTimer) clearTimeout(debounceTimer);
            const timer = setTimeout(() => fetchSuggestions(value), 400);
            setDebounceTimer(timer);

            // Hide history when typing
            setShowSearchHistory(false);
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowDropdown(false);
              setShowSearchHistory(false);
            }, 150);
          }}
          onFocus={() => {
            if (searchQuery.trim() === '') {
              setShowSearchHistory(true);
              setShowDropdown(true);
            }
          }}
          className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {showDropdown && (
          <ul className="absolute rounded-xl left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-1 shadow-lg max-h-60 overflow-y-auto">
            {showSearchHistory && searchQuery.trim() === '' ? (
              searchHistory.length > 0 ? (
                searchHistory.map((city, i) => (
                  <li
                    key={`${instanceId}-history-${i}`}
                    // Prevents input's onBlur from firing before this click/tap registers
                    // (critical on touch devices, where blur can beat click otherwise)
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectCity(city)}
                    className="px-4 py-3 sm:py-2 cursor-pointer active:bg-gray-200 dark:active:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {city}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 sm:py-2 text-sm text-gray-400 dark:text-gray-500">
                  No recent searches
                </li>
              )
            ) : (
              suggestions.map((sugg, i) => {
                const fullName = `${sugg.name}, ${sugg.country}`;
                return (
                  <li
                    key={`${instanceId}-sugg-${i}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectCity(fullName)}
                    className="px-4 py-3 sm:py-2 cursor-pointer active:bg-gray-200 dark:active:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {fullName}
                  </li>
                );
              })
            )}
          </ul>
        )}

        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );

  return (
    <header className="fixed w-screen top-0 left-0 z-10 transition-all duration-300 bg-white dark:bg-gray-900/90 backdrop-blur-md py-3">
      <nav aria-label="Global" className="w-full flex items-center px-4 justify-between md:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="/" className="flex items-center gap-2 group" target='_self'>
            <img src={logo} className="w-14 h-14 md:w-12 md:h-12" alt="weather app logo" />
            <span className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400 hidden sm:block">
             SkySnapping 
            </span>
          </a>
        </div>

        {/* Search bar - desktop */}
        <div className="flex-1 max-w-md mx-4 hidden md:flex md:items-center md:gap-2">
          {renderSearchForm('desktop', desktopContainerRef)}

          {/* Use my location button (desktop) */}
          {onUseMyLocation && (
            <button
              type="button"
              onClick={onUseMyLocation}
              title="Use my location"
              className="flex-shrink-0 flex items-center justify-center p-2 rounded-full border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 
                         hover:text-blue-600 hover:border-blue-400 transition-colors"
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden gap-4 items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop navigation links */}
        <div className="hidden lg:flex lg:gap-x-8 items-center">
          <Link
            to="/about"
            className="text-base font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 relative group py-2"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <a
            href="https://fadmacharki.netlify.app"
            target='_blank'
            className="text-base font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 relative group py-2"
          >
            Developer
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>
      </nav>

      {/* Mobile search bar - only visible when menu is closed */}
      <div className="px-4 pt-2 md:hidden flex items-center gap-2">
        {renderSearchForm('mobile-bar', mobileBarContainerRef)}

        {/* Use my location button (mobile top bar) */}
        {onUseMyLocation && (
          <button
            type="button"
            onClick={onUseMyLocation}
            title="Use my location"
            className="flex-shrink-0 flex items-center justify-center p-2 rounded-full border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 
                       hover:text-blue-600 hover:border-blue-400 transition-colors"
          >
            <MapPinIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Location error message */}
      {locationError && (
        <div className="px-4 md:px-8 pt-1">
          <p className="text-xs text-red-500 dark:text-red-400">{locationError}</p>
        </div>
      )}

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src={logo} className="w-12 h-12 md:w-12 md:h-12" alt="weather app logo" />
              <span className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400 hidden sm:block">
                SkySnapping
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile menu search */}
          <div className="mt-6">
            {renderSearchForm('mobile-menu', mobileMenuContainerRef)}
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
              <div className="space-y-1 py-6">
                {/* Use my location (mobile menu) */}
                {onUseMyLocation && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseMyLocation();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MapPinIcon className="h-5 w-5" />
                    Use my location
                  </button>
                )}
                <Link
                  to="/about"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <a
                  href="https://fadmacharki.netlify.app"
                  target='_blank'
                  className="block rounded-lg px-3 py-2 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Developer
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default WeatherNavBar;