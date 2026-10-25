import { useCallback, useEffect, useState } from 'react';
import { searchCities } from '../lib/weatherApi';
import type { CitySuggestion } from '../types/weather';

const HISTORY_STORAGE_KEY = 'skysnap:search-history';
const MAX_HISTORY_ITEMS = 5;

const readSearchHistory = (): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(stored)) return [];

    return stored.filter((item): item is string => typeof item === 'string').slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
};

const writeSearchHistory = (history: string[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage can be unavailable (private mode, quota), history is non-critical.
  }
};

export const useCitySearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>(readSearchHistory);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = window.setTimeout(() => {
      searchCities(trimmedQuery, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) setSuggestions(results);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const addToHistory = useCallback((city: string) => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    setHistory((previousHistory) => {
      const updatedHistory = [
        trimmedCity,
        ...previousHistory.filter((item) => item.toLowerCase() !== trimmedCity.toLowerCase()),
      ].slice(0, MAX_HISTORY_ITEMS);

      writeSearchHistory(updatedHistory);
      return updatedHistory;
    });
  }, []);

  const refreshHistory = useCallback(() => setHistory(readSearchHistory()), []);

  return {
    query,
    setQuery,
    suggestions,
    isSearching,
    history,
    addToHistory,
    refreshHistory,
  };
};
