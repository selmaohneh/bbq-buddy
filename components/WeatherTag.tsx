import { WeatherType } from '@/types/session'
import Icon from '@mdi/react'
import { mdiWeatherSunny, mdiWeatherCloudy, mdiWeatherWindy, mdiWeatherRainy, mdiWeatherSnowy } from '@mdi/js'

interface WeatherTagProps {
  weather: WeatherType
  size?: 'sm' | 'md'
  showText?: boolean
}

const WEATHER_ICON_PATHS = {
  Sunny: mdiWeatherSunny,
  Cloudy: mdiWeatherCloudy,
  Windy: mdiWeatherWindy,
  Rain: mdiWeatherRainy,
  Snow: mdiWeatherSnowy,
}

export function WeatherTag({ weather, size = 'sm', showText = true }: WeatherTagProps) {
  const iconPath = WEATHER_ICON_PATHS[weather]
  const sizeClasses = showText 
    ? (size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1')
    : (size === 'sm' ? 'p-1' : 'p-1.5')
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        bg-blue-500 text-white border border-blue-600
        ${sizeClasses}
      `}
      title={!showText ? weather : undefined}
    >
      <Icon path={iconPath} size={size === 'sm' ? 0.5 : 0.55} className={iconSize} />
      {showText && <span>{weather}</span>}
    </span>
  )
}