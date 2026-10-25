import { getWeatherIconUrl } from '../../lib/weather';

type WeatherIconProps = {
  iconCode?: string;
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
};

const WeatherIcon = ({
  iconCode,
  size = 48,
  alt = 'Weather condition',
  className = '',
  priority = false,
}: WeatherIconProps) => {
  if (!iconCode) return null;

  return (
    <img
      src={getWeatherIconUrl(iconCode)}
      alt={alt}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={className}
    />
  );
};

export default WeatherIcon;
