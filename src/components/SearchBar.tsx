import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Clock, Loader2, Search } from 'lucide-react';
import { getSuggestionLabel } from '../lib/weatherApi';
import { useCitySearch } from '../hooks/useCitySearch';

type SearchBarProps = {
  onSearch: (city: string) => void;
  placeholder?: string;
  className?: string;
};

type SearchOption = {
  value: string;
  label: string;
};

const SearchBar = ({
  onSearch,
  placeholder = 'Search for a city...',
  className = '',
}: SearchBarProps) => {
  const { query, setQuery, suggestions, isSearching, history, addToHistory, refreshHistory } =
    useCitySearch();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<number | null>(null);

  const trimmedQuery = query.trim();
  const showingHistory = trimmedQuery === '';
  const options: SearchOption[] = showingHistory
    ? history.map((city) => ({ value: city, label: city }))
    : suggestions.map((suggestion) => ({
        value: getSuggestionLabel(suggestion),
        label: getSuggestionLabel(suggestion),
      }));

  useEffect(
    () => () => {
      if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
    },
    []
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  const commitSearch = (city: string) => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    setQuery(trimmedCity);
    addToHistory(trimmedCity);
    onSearch(trimmedCity);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (highlightedIndex >= 0 && options[highlightedIndex]) {
      commitSearch(options[highlightedIndex].value);
      return;
    }

    if (trimmedQuery) commitSearch(trimmedQuery);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      if (options.length > 0) {
        setHighlightedIndex((index) => (index + 1) % options.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (options.length > 0) {
        setHighlightedIndex((index) => (index <= 0 ? options.length - 1 : index - 1));
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    blurTimerRef.current = window.setTimeout(() => setIsOpen(false), 150);
  };

  const handleFocus = () => {
    if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
    refreshHistory();
    setIsOpen(true);
  };

  const showEmptyState =
    options.length === 0 && (!isSearching || showingHistory);
  const emptyMessage = showingHistory ? 'No recent searches' : 'No matching cities found';

  return (
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search for a city"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-gray-900
                     placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2
                     focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <button
          type="submit"
          aria-label="Search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors
                     hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </form>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border
                     border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          {options.map((option, index) => (
            <li
              key={`${showingHistory ? 'history' : 'suggestion'}-${option.value}-${index}`}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={highlightedIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => commitSearch(option.value)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-3 text-sm sm:py-2 ${
                highlightedIndex === index
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {showingHistory && <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />}
              <span className="truncate">{option.label}</span>
            </li>
          ))}

          {isSearching && !showingHistory && options.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Searching...</li>
          )}

          {showEmptyState && (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">{emptyMessage}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
