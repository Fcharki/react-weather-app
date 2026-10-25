import type {
  CitySuggestion,
  Coordinates,
  CurrentWeather,
  ForecastItem,
  WeatherQuery,
  WeatherSnapshot,
} from '../types/weather';

const BASE_URL = (import.meta.env.VITE_BASE_URL || 'https://api.openweathermap.org').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const CACHE_TTL_MS = 5 * 60 * 1000;

type ApiErrorCode = 'missing-key' | 'not-found' | 'rate-limit' | 'request-failed';

export class WeatherApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

type RequestOptions = {
  signal?: AbortSignal;
  force?: boolean;
};

const weatherCache = new Map<string, CacheEntry<WeatherSnapshot>>();
const suggestionCache = new Map<string, CacheEntry<CitySuggestion[]>>();

const readCache = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined => {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return entry.data;
};

const writeCache = <T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): T => {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
};

const requireApiKey = (): string => {
  if (!API_KEY) {
    throw new WeatherApiError(
      'Missing weather API key. Add VITE_WEATHER_API_KEY to your .env file.',
      'missing-key'
    );
  }
  return API_KEY;
};

const request = async <T>(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
  includeMetricUnits = true
): Promise<T> => {
  const url = new URL(path, BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  url.searchParams.set('appid', requireApiKey());
  if (includeMetricUnits) url.searchParams.set('units', 'metric');

  const response = await fetch(url, { signal });

  if (!response.ok) {
    if (response.status === 404) {
      throw new WeatherApiError('The requested city could not be found.', 'not-found');
    }
    if (response.status === 429) {
      throw new WeatherApiError('The weather service rate limit was reached. Try again shortly.', 'rate-limit');
    }
    throw new WeatherApiError('The weather service returned an unexpected error.', 'request-failed');
  }

  return response.json() as Promise<T>;
};

const buildSnapshot = (current: CurrentWeather, forecast: ForecastItem[]): WeatherSnapshot => ({
  current,
  forecast,
  location: {
    name: current.name,
    country: current.sys?.country ?? '',
    lat: current.coord.lat,
    lon: current.coord.lon,
    timezone: current.timezone ?? 0,
  },
});

const fetchCoordinatesSnapshot = async (
  coordinates: Coordinates,
  signal?: AbortSignal
): Promise<WeatherSnapshot> => {
  const { latitude, longitude } = coordinates;
  const [current, forecast] = await Promise.all([
    request<CurrentWeather>('/data/2.5/weather', { lat: latitude, lon: longitude }, signal),
    request<{ list: ForecastItem[] }>('/data/2.5/forecast', { lat: latitude, lon: longitude }, signal),
  ]);

  return buildSnapshot(current, forecast.list);
};

const fetchCitySnapshot = async (city: string, signal?: AbortSignal): Promise<WeatherSnapshot> => {
  const [current, forecast] = await Promise.all([
    request<CurrentWeather>('/data/2.5/weather', { q: city }, signal),
    request<{ list: ForecastItem[] }>('/data/2.5/forecast', { q: city }, signal),
  ]);

  return buildSnapshot(current, forecast.list);
};

const getCacheKey = (query: WeatherQuery): string | null => {
  const city = query.city?.trim();
  if (city) return `city:${city.toLowerCase()}`;

  if (query.coordinates) {
    const { latitude, longitude } = query.coordinates;
    return `coords:${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  }

  return null;
};

export const fetchWeather = async (
  query: WeatherQuery,
  { signal, force = false }: RequestOptions = {}
): Promise<WeatherSnapshot> => {
  const cacheKey = getCacheKey(query);

  if (!cacheKey) {
    throw new WeatherApiError('No valid location was provided.', 'request-failed');
  }

  if (!force) {
    const cached = readCache(weatherCache, cacheKey);
    if (cached) return cached;
  }

  const snapshot = query.city?.trim()
    ? await fetchCitySnapshot(query.city.trim(), signal)
    : await fetchCoordinatesSnapshot(query.coordinates!, signal);

  return writeCache(weatherCache, cacheKey, snapshot);
};

export const searchCities = async (
  query: string,
  signal?: AbortSignal
): Promise<CitySuggestion[]> => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const cached = readCache(suggestionCache, normalizedQuery);
  if (cached) return cached;

  const suggestions = await request<CitySuggestion[]>(
    '/geo/1.0/direct',
    { q: query.trim(), limit: 5 },
    signal,
    false
  );

  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.name === suggestion.name &&
          candidate.country === suggestion.country &&
          candidate.state === suggestion.state
      ) === index
  );

  return writeCache(suggestionCache, normalizedQuery, uniqueSuggestions);
};

export const getSuggestionLabel = (suggestion: CitySuggestion): string =>
  [suggestion.name, suggestion.state, suggestion.country].filter(Boolean).join(', ');
