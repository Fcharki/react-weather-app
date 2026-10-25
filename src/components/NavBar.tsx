import { useState } from 'react';
import { ArrowPathIcon, Bars3Icon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/sun-logo.png';
import SearchBar from './SearchBar';

type WeatherNavBarProps = {
  onSearch?: (city: string) => void;
  onUseMyLocation?: () => void;
  locationError?: string | null;
  isLocating?: boolean;
};

type LocationIconButtonProps = {
  onClick: () => void;
  isLocating?: boolean;
};

const LocationIconButton = ({ onClick, isLocating = false }: LocationIconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLocating}
    title="Use my location"
    aria-label="Use my location"
    className="flex flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white p-2
               text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600
               disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
  >
    {isLocating ? (
      <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
    ) : (
      <MapPinIcon className="h-5 w-5" aria-hidden="true" />
    )}
  </button>
);

const WeatherNavBar = ({
  onSearch,
  onUseMyLocation,
  locationError,
  isLocating = false,
}: WeatherNavBarProps) => {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (city: string) => {
    onSearch?.(city);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/95 py-3 backdrop-blur-md dark:bg-gray-900/95">
      <nav aria-label="Global" className="flex w-full items-center justify-between px-4 md:px-8">
        <div className="flex-shrink-0">
          <Link to="/" className="group flex items-center gap-2">
            <img src={logo} className="h-14 w-14 md:h-12 md:w-12" alt="SkySnapping logo" />
            <span className="hidden text-lg font-bold text-blue-700 dark:text-blue-400 sm:block md:text-xl">
              SkySnapping
            </span>
          </Link>
        </div>

        {!isAboutPage && onSearch && (
          <div className="mx-4 hidden max-w-md flex-1 items-center gap-2 md:flex">
            <SearchBar onSearch={handleSearch} />

            {onUseMyLocation && (
              <LocationIconButton onClick={onUseMyLocation} isLocating={isLocating} />
            )}
          </div>
        )}

        <div className="flex items-center gap-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className="hidden items-center lg:flex lg:gap-x-8">
          <Link
            to="/about"
            className="group relative py-2 text-base font-medium text-blue-700 transition-colors duration-300 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            About
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full dark:bg-blue-400" />
          </Link>
          <a
            href="https://fadmacharki.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative py-2 text-base font-medium text-blue-700 transition-colors duration-300 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Developer
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full dark:bg-blue-400" />
          </a>
        </div>
      </nav>

      {!isAboutPage && onSearch && (
        <div className="flex items-center gap-2 px-4 pt-2 md:hidden">
          <SearchBar onSearch={handleSearch} />

          {onUseMyLocation && (
            <LocationIconButton onClick={onUseMyLocation} isLocating={isLocating} />
          )}
        </div>
      )}

      {locationError && (
        <div className="px-4 pt-1 md:px-8">
          <p role="status" className="text-xs text-red-500 dark:text-red-400">
            {locationError}
          </p>
        </div>
      )}

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />

        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 dark:bg-gray-900 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <img src={logo} className="h-12 w-12" alt="SkySnapping logo" />
              <span className="hidden text-lg font-bold text-blue-700 dark:text-blue-400 sm:block md:text-xl">
                SkySnapping
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          {!isAboutPage && onSearch && (
            <div className="mt-6">
              <SearchBar onSearch={handleSearch} />
            </div>
          )}

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
              <div className="space-y-1 py-6">
                {onUseMyLocation && !isAboutPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseMyLocation();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-base font-medium text-blue-700 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-800"
                  >
                    <MapPinIcon className="h-5 w-5" aria-hidden="true" />
                    Use my location
                  </button>
                )}
                <Link
                  to="/about"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-blue-700 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <a
                  href="https://fadmacharki.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-blue-700 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-800"
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
