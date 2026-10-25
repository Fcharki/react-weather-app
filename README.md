# SkySnapping

SkySnapping is a responsive weather application that shows current conditions, an hourly outlook, and a 7-day forecast for your location or any city in the world. It pairs live OpenWeather data with full-screen weather artwork, a glassmorphism interface, and a mobile-first layout.

- Live app: [skysnapping.netlify.app](https://skysnapping.netlify.app)
- Repository: [github.com/Fcharki/react-weather-app](https://github.com/Fcharki/react-weather-app)

## Features

- Current conditions: temperature, feels-like, humidity, sunrise, sunset, and condition artwork
- Hourly forecast for the next 24 hours
- 7-day forecast with average daily temperature and the dominant weather condition
- Search any city with debounced autocomplete suggestions
- Recent search history stored locally
- "Use my location" support through the browser Geolocation API
- City-local time formatting (sunrise, sunset, hourly slots, and dates)
- Dynamic day/night backgrounds that follow the current weather condition and icon
- Clear nights use a starry moon scene; other conditions use darkened night variants
- Keyboard-accessible search combobox with arrow-key navigation and Escape support
- Responsive layouts for mobile portrait, mobile landscape, tablet, and desktop
- SPA routing with a dedicated About page

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Icons | lucide-react, Heroicons |
| Animations | Lottie (`lottie-react`) |
| Data | OpenWeather Current Weather, 5-day/3-hour Forecast, and Geocoding APIs |
| Quality | ESLint, TypeScript strict mode |

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A free [OpenWeather API key](https://home.openweathermap.org/api_keys)

### Installation

```bash
git clone https://github.com/Fcharki/react-weather-app.git
cd react-weather-app
npm install
```

### Environment variables

Create a `.env` file in the project root. You can copy `.env.example` as a starting point.

```env
VITE_WEATHER_API_KEY=your_openweather_api_key
VITE_BASE_URL=https://api.openweathermap.org
```

`VITE_BASE_URL` is optional and defaults to `https://api.openweathermap.org`.

> Vite exposes variables prefixed with `VITE_` in the browser bundle. Never commit a real API key. Use a dedicated key, restrict it in the OpenWeather dashboard when possible, and rotate it if it is ever exposed.

### Run locally

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the repository |

## Project structure

```text
src/
  App.tsx                       App shell, routing, search and geolocation state
  main.tsx                      React entry point
  index.css                     Tailwind entry, global font and base styles
  components/
    NavBar.tsx                  Fixed responsive navigation and mobile drawer
    SearchBar.tsx               Accessible city search combobox
    About.tsx                   Lazy-loaded About page
    weather/
      WeatherDashboard.tsx      Data orchestration and responsive page layout
      CurrentWeatherCard.tsx    Current conditions summary
      ForecastPanel.tsx         Hourly/weekly tabs and forecast list
      WeatherIcon.tsx           OpenWeather icon renderer
  hooks/
    useWeather.ts               Weather fetching, caching, retries and cancellation
    useCitySearch.ts            Debounced geocoding search and recent history
  lib/
    weatherApi.ts               OpenWeather client, cache and API error handling
    weather.ts                  Formatting and forecast aggregation helpers
    weatherBackground.ts        Condition normalization, day/night detection, background maps
  types/
    weather.ts                  Shared TypeScript models
```

## How it works

1. `App` keeps the active search city, the default/current coordinates, and geolocation status.
2. `SearchBar` debounces typing, requests city suggestions from the OpenWeather Geocoding API, and stores the five most recent searches in `localStorage`.
3. `useWeather` chooses a city query or coordinate query, cancels stale requests with `AbortController`, and keeps a five-minute in-memory cache.
4. Current weather and forecast requests run in parallel with `Promise.all`, so the dashboard resolves with a single round trip.
5. `lib/weather.ts` converts raw API data into timezone-aware hourly and daily entries. The daily view groups three-hour forecast slots by city-local date, averages the temperature, and picks the most common condition.
6. `WeatherDashboard` selects the matching background image and renders the same responsive card layout on all screen sizes.

## Responsive design

- Mobile-first spacing with safe-area padding for notched devices.
- The weather page uses normal document flow instead of a fixed full-screen overlay, so mobile browser chrome and scrolling behave correctly.
- Forecast entries render as compact rows on small screens and as a 4- or 7-column grid from `sm` and `md` upward.
- The navigation search bar is available inline on desktop and below the header on mobile, with a slide-over menu for secondary links.
- Search supports touch selection, keyboard navigation, focus rings, and ARIA combobox semantics.

## Performance notes

- Background artwork was converted from JPEG to WebP and resized to a maximum of 2048 px, reducing the asset payload from about 8.9 MB to about 2.1 MB, including generated night variants.
- The About page and its Lottie animations are code-split and loaded on demand.
- Weather requests are cached for five minutes and deduplicated by city or rounded coordinates.
- In-flight requests are aborted when the city or location changes, preventing race conditions and unnecessary updates.
- Forecast icons are lazy-loaded; the current-condition icon is prioritized.
- React state stores plain forecast data rather than JSX, which keeps memoized transformations cheap.

## Deployment

The app is a static SPA and deploys to any static host.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_WEATHER_API_KEY`
- `public/_redirects` already rewrites all routes to `index.html` so React Router works on refresh:

```text
/*    /index.html   200
```

## Weather data

Weather data is provided by [OpenWeather](https://openweathermap.org/). This project uses the Current Weather, 5-day/3-hour Forecast, and Geocoding endpoints.

## Author

Built by [Fadma Charki](https://fadmacharki.netlify.app).
