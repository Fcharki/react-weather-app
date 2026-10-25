import { useMemo, useState } from 'react';
import { Loader } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import { buildHourlyForecast, buildWeeklyForecast } from '../../lib/weather';
import { getWeatherBackground, isNightWeather } from '../../lib/weatherBackground';
import type { WeatherDashboardProps } from '../../types/weather';
import CurrentWeatherCard from './CurrentWeatherCard';
import ForecastPanel, { type ForecastTab } from './ForecastPanel';

type StatusPanelProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const StatusPanel = ({ loading = false, error, onRetry }: StatusPanelProps) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/80 p-8 text-center text-gray-900 shadow-lg backdrop-blur-md sm:min-h-[420px] sm:border-white/30 sm:bg-white/90">
    {loading ? (
      <>
        <Loader className="mb-4 h-10 w-10 animate-spin" aria-hidden="true" />
        <p className="text-sm sm:text-base">Loading weather data...</p>
      </>
    ) : (
      <>
        <p className="mb-4 max-w-sm text-sm font-medium text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Try again
        </button>
      </>
    )}
  </div>
);

const WeatherDashboard = ({ city, coordinates, isLoadingLocation = false }: WeatherDashboardProps) => {
  const [activeTab, setActiveTab] = useState<ForecastTab>('day');
  const { data, isLoading, error, refresh } = useWeather({
    city,
    coordinates,
    enabled: !isLoadingLocation,
  });

  const isNight = data ? isNightWeather(data.current) : false;
  const backgroundImage = getWeatherBackground(data?.current.weather[0]?.description ?? '', isNight);

  const hourlyForecast = useMemo(
    () => (data ? buildHourlyForecast(data.current, data.forecast, data.location.timezone) : []),
    [data]
  );

  const weeklyForecast = useMemo(
    () => (data ? buildWeeklyForecast(data.forecast, data.location.timezone) : []),
    [data]
  );

  const showFullLoader = isLoadingLocation || (isLoading && !data);
  const isRefreshing = isLoading && Boolean(data);

  return (
    <section className="relative isolate min-h-dvh w-full overflow-hidden bg-slate-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 bg-gradient-to-b ${
          isNight
            ? 'from-slate-950/35 via-slate-900/10 to-slate-950/45 sm:from-slate-950/10 sm:via-transparent sm:to-slate-950/20'
            : 'from-slate-900/40 via-slate-900/15 to-slate-900/45 sm:from-slate-900/15 sm:via-transparent sm:to-slate-900/25'
        }`}
      />

      <div className="relative mx-auto w-full max-w-2xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-36 sm:px-6 md:pt-28">
        <div className="rounded-3xl sm:border sm:border-white/20 sm:bg-white/10 sm:p-4 sm:backdrop-blur-sm">
          {showFullLoader ? (
            <StatusPanel loading />
          ) : error && !data ? (
            <StatusPanel error={error} onRetry={refresh} />
          ) : data ? (
            <>
              {error && (
                <div
                  role="alert"
                  className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
                >
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={refresh}
                    className="flex-shrink-0 rounded-full bg-red-100 px-3 py-1.5 font-medium"
                  >
                    Retry
                  </button>
                </div>
              )}

              <CurrentWeatherCard current={data.current} location={data.location} />
              <ForecastPanel
                activeTab={activeTab}
                hourly={hourlyForecast}
                weekly={weeklyForecast}
                onTabChange={setActiveTab}
                onRefresh={refresh}
                isRefreshing={isRefreshing}
              />
            </>
          ) : (
            <StatusPanel error="Weather data is unavailable right now." onRetry={refresh} />
          )}
        </div>
      </div>
    </section>
  );
};

export default WeatherDashboard;
