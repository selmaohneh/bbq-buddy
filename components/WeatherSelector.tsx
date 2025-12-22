'use client'

import { WeatherType, WEATHER_OPTIONS } from '@/types/session'
import Icon from '@mdi/react'
import { mdiWeatherSunny, mdiWeatherCloudy, mdiWeatherWindy, mdiWeatherRainy, mdiWeatherSnowy } from '@mdi/js'

interface WeatherSelectorProps {
  value: WeatherType[] | null
  onChange: (value: WeatherType[]) => void
}

const WEATHER_ICON_PATHS = {
  Sunny: mdiWeatherSunny,
  Cloudy: mdiWeatherCloudy,
  Windy: mdiWeatherWindy,
  Rain: mdiWeatherRainy,
  Snow: mdiWeatherSnowy,
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
        const iconPath = WEATHER_ICON_PATHS[option.value]

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
            <Icon path={iconPath} size={0.6} className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
