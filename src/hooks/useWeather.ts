import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather, WeatherApiError } from '../lib/weatherApi';
import type { Coordinates, WeatherSnapshot } from '../types/weather';

type UseWeatherOptions = {
  city?: string;
  coordinates?: Coordinates;
  enabled?: boolean;
};

const getErrorMessage = (error: unknown, city?: string): string => {
  if (error instanceof WeatherApiError) {
    if (error.code === 'not-found' && city) {
      return `Could not find weather for "${city}". Check the spelling and try again.`;
    }
    return error.message;
  }

  return 'Unable to load weather data. Check your connection and try again.';
};

export const useWeather = ({ city, coordinates, enabled = true }: UseWeatherOptions) => {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const forceNextRequest = useRef(false);

  const normalizedCity = city?.trim() || undefined;
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;
  const requestKey =
    normalizedCity ??
    (latitude !== undefined && longitude !== undefined
      ? `${latitude.toFixed(3)},${longitude.toFixed(3)}`
      : null);

  useEffect(() => {
    if (!enabled || !requestKey) {
      return;
    }

    const controller = new AbortController();
    const force = forceNextRequest.current;
    forceNextRequest.current = false;
    setLoading(true);
    setError(null);

    fetchWeather(
      normalizedCity
        ? { city: normalizedCity }
        : { coordinates: { latitude: latitude!, longitude: longitude! } },
      { signal: controller.signal, force }
    )
      .then((snapshot) => {
        if (controller.signal.aborted) return;
        setData(snapshot);
        setLoadedKey(requestKey);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(requestError, normalizedCity));
        setLoadedKey(requestKey);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, normalizedCity, latitude, longitude, requestKey, refreshCount]);

  const refresh = useCallback(() => {
    forceNextRequest.current = true;
    setRefreshCount((count) => count + 1);
  }, []);

  const isLoading = Boolean(requestKey) && (loading || loadedKey !== requestKey);
  const snapshot = loadedKey === requestKey ? data : null;

  return { data: snapshot, isLoading, error, refresh };
};
