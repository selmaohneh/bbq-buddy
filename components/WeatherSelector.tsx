'use client'

import { WeatherType, WEATHER_OPTIONS } from '@/types/session'
import { Sun, Cloud, Wind, CloudRain, CloudSnow } from 'lucide-react'

interface WeatherSelectorProps {
  value: WeatherType[] | null
  onChange: (value: WeatherType[]) => void
}

const WEATHER_ICONS = {
  Sunny: Sun,
  Cloudy: Cloud,
  Windy: Wind,
  Rain: CloudRain,
  Snow: CloudSnow,
}

export function WeatherSelector({ value, onChange }: WeatherSelectorProps) {
  const selectedWeather = value || []

  const handleToggle = (weather: WeatherType) => {
    if (selectedWeather.includes(weather)) {
      // Remove weather from selection
      onChange(selectedWeather.filter(w => w !== weather))
    } else {
      // Add weather to selection
      onChange([...selectedWeather, weather])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {WEATHER_OPTIONS.map((option) => {
        const isSelected = selectedWeather.includes(option.value)
        const IconComponent = WEATHER_ICONS[option.value]

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-150 ease-in-out
              border
              ${isSelected
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-blue-50 text-blue-600 border-blue-300 hover:border-blue-400 hover:bg-blue-100'
              }
            `}
            aria-pressed={isSelected}
          >
            <IconComponent className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
