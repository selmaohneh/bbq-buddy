import { WeatherType } from '@/types/session'
import { Sun, Cloud, Wind, CloudRain, CloudSnow } from 'lucide-react'

interface WeatherTagProps {
  weather: WeatherType
  size?: 'sm' | 'md'
  showText?: boolean
}

const WEATHER_ICONS = {
  Sunny: Sun,
  Cloudy: Cloud,
  Windy: Wind,
  Rain: CloudRain,
  Snow: CloudSnow,
}

export function WeatherTag({ weather, size = 'sm', showText = true }: WeatherTagProps) {
  const IconComponent = WEATHER_ICONS[weather]
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
      <IconComponent className={iconSize} />
      {showText && <span>{weather}</span>}
    </span>
  )
}