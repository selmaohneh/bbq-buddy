'use client'

import { MealTime, MEAL_TIME_OPTIONS } from '@/types/session'

interface MealTimeSelectorProps {
  value: MealTime | null
  onChange: (value: MealTime | null) => void
}

export function MealTimeSelector({ value, onChange }: MealTimeSelectorProps) {
  const handleSelect = (option: MealTime) => {
    // Toggle selection - clicking the same option deselects it
    if (value === option) {
      onChange(null)
    } else {
      onChange(option)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {MEAL_TIME_OPTIONS.map((option) => {
        const isSelected = value === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-150 ease-in-out
              border
              ${isSelected
                ? 'bg-gray-500 text-white border-gray-500'
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
              }
            `}
            aria-pressed={isSelected}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
