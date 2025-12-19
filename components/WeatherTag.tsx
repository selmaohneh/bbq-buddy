import { WeatherType } from '@/types/session'
import { Sun, Cloud, Wind, CloudRain, CloudSnow } from 'lucide-react'

interface WeatherTagProps {
  weather: WeatherType
  size?: 'sm' | 'md'
}

const WEATHER_ICONS = {
  Sunny: Sun,
  Cloudy: Cloud,
  Windy: Wind,
  Rain: CloudRain,
  Snow: CloudSnow,
}

export function WeatherTag({ weather, size = 'sm' }: WeatherTagProps) {
  const IconComponent = WEATHER_ICONS[weather]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        bg-blue-500 text-white border border-blue-600
        ${sizeClasses}
      `}
    >
      <IconComponent className={iconSize} />
      <span>{weather}</span>
    </span>
  )
}
