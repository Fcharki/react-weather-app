import { useState } from 'react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Dialog, Disclosure } from '@headlessui/react';
import logo from '../assets/images/sun-logo.png';



const WeatherNavBar: React.FC<{ onSearch?: (city: string) => void }> = ({ onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
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
  }

  return (
    <header className="fixed w-screen top-0 left-0 z-10 transition-all duration-300 bg-transparent dark:bg-gray-900/90 backdrop-blur-md py-3">
      <nav aria-label="Global" className="w-full flex items-center px-4 justify-between md:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="/" className="flex items-center gap-2 group">
            <img src={logo} className="w-24 h-24 md:w-12 md:h-12" alt="weather app logo" />
            <span className="text-lg md:text-xl font-bold font-mono text-blue-700 dark:text-blue-400 hidden sm:block">
             SkySnap
            </span>
          </a>
        </div>
        
        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);

                            if (debounceTimer) clearTimeout(debounceTimer);

                            const timer = setTimeout(() => fetchSuggestions(value), 400);
                            setDebounceTimer(timer);
                      }}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}  
              // clean up suggestions on submit or blur
              className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {suggestions.length > 0 && (
              <ul className="absolute rounded-4xl border border-gray-200 border-opacity-30 z-20 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((city, index) => (
                  <li
                    key={`${city.name}-${index}`}
                    onClick={() => {
                      setSearchQuery(`${city.name}, ${city.country}`);
                      setSuggestions([]);
                      onSearch?.(`${city.name},${city.country}`);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {city.name}, {city.state ? `${city.state}, ` : ''}{city.country}
                  </li>
                ))}
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
        <div className="hidden lg:flex lg:gap-x-8 items-center font-[Figtree]">
          <a 
            href="/" 
            className="text-base font-mono font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 relative group py-2"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="/forecast" 
            className="text-base  font-mono font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 relative group py-2"
          >
            Forecast
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="/maps" 
            className="text-base font-medium  font-mono text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 relative group py-2"
          >
            Weather Maps
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          
          <div className="relative group">
            <button className="flex items-center gap-x-1  font-mono text-base font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 py-2">
              More
              <ChevronDownIcon className="w-5 h-5 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
            
            <div className="absolute hidden group-hover:block top-full right-0 z-50 mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
              <div className="p-2">
                <a 
                  href="/alerts" 
                  className="block rounded-md  font-mono px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Weather Alerts
                </a>
                <a
                  href="/history"
                  className="block rounded-md  font-mono px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Weather History
                </a>
                <a
                  href="/settings"
                  className="block rounded-md font-mono px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile search bar - only visible when menu is closed */}
      <div className="px-4 pt-2 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
      
      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
                  <img src={logo} className="w-12 h-12 md:w-12 md:h-12" alt="weather app logo" />
                    <span className="text-lg md:text-xl font-bold font-mono text-blue-700 dark:text-blue-400 hidden sm:block">
                    SkySnap
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
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
              <div className="space-y-1 py-6 font-[Figtree]">
                <a
                  href="/"
                  className="block rounded-lg font-mono px-3 py-2 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/forecast"
                  className="block rounded-lg font-mono px-3 py-2 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Forecast
                </a>
                <a
                  href="/maps"
                  className="block rounded-lg font-mono px-3 py-2 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Weather Maps
                </a>
                
                <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex font-mono w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-medium text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        More
                        <ChevronDownIcon
                          className={`h-5 w-5 flex-none ${open ? 'rotate-180' : ''} text-blue-500`}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-1 space-y-1">
                        <a
                          href="/alerts"
                          className="block rounded-lg py-2 pl-6 font-mono pr-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Weather Alerts
                        </a>
                        <a
                          href="/history"
                          className="block rounded-lg py-2 pl-6 font-mono pr-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Weather History
                        </a>
                        <a
                          href="/settings"
                          className="block rounded-lg py-2 pl-6 font-mono pr-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Settings
                        </a>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default WeatherNavBar;