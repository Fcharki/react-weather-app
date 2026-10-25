import { RefreshCw } from 'lucide-react';
import type { ForecastEntry } from '../../types/weather';
import { formatTemp } from '../../lib/weather';
import WeatherIcon from './WeatherIcon';

export type ForecastTab = 'day' | 'week';

type ForecastPanelProps = {
  activeTab: ForecastTab;
  hourly: ForecastEntry[];
  weekly: ForecastEntry[];
  onTabChange: (tab: ForecastTab) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

const ForecastPanel = ({
  activeTab,
  hourly,
  weekly,
  onTabChange,
  onRefresh,
  isRefreshing = false,
}: ForecastPanelProps) => {
  const entries = activeTab === 'day' ? hourly : weekly;
  const title = activeTab === 'day' ? '24-hour forecast' : '7-day forecast';

  return (
    <section className="mt-4 rounded-3xl border border-white/50 bg-white/80 p-4 text-gray-900 backdrop-blur-md sm:border-white/30 sm:bg-white/70">
      <div className="mb-4 flex rounded-full bg-gray-200/70 p-1 sm:mx-auto sm:w-fit">
        {(['day', 'week'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex-1 rounded-full px-6 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'day' ? (
              <>
                <span className="sm:hidden">24 Hours</span>
                <span className="hidden sm:inline">Day</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">7 Days</span>
                <span className="hidden sm:inline">Week</span>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium sm:text-lg">{title}</h3>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh forecast"
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-full bg-yellow-200/80 px-3 py-2 text-xs text-gray-800
                     transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="hidden sm:inline">Refresh</span>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {entries.length > 0 ? (
        <ul className="space-y-2 sm:grid sm:grid-cols-4 sm:gap-3 sm:space-y-0 md:grid-cols-7">
          {entries.map((entry, index) => (
            <li
              key={`${entry.label}-${index}`}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-gray-900 shadow-sm
                         ring-1 ring-black/5 transition-colors sm:flex-col sm:justify-center sm:px-2
                         sm:py-3 sm:text-center sm:hover:bg-yellow-100"
            >
              <span className="w-20 whitespace-nowrap text-sm font-medium text-gray-600 sm:order-3 sm:mt-1 sm:w-auto">
                {entry.label}
              </span>
              <WeatherIcon
                iconCode={entry.icon}
                size={40}
                alt={entry.description}
                className="h-10 w-10 flex-shrink-0 sm:order-1"
              />
              <span className="w-14 text-right text-base font-semibold sm:order-2 sm:w-auto">
                {formatTemp(entry.temp)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">
          No forecast available right now.
        </p>
      )}
    </section>
  );
};

export default ForecastPanel;
