'use client'

import { useState, useRef, useEffect } from 'react'
import { PREDEFINED_MEAT_TYPES } from '@/types/session'
import { Carrot, Drumstick, Fish, Ham, MoreHorizontal, X, CircleOff } from 'lucide-react'

interface MeatTypeSelectorProps {
  value: string[] | null
  onChange: (value: string[]) => void
}

// Icon mapping
// Note: Lucide might not have 'Beef', so we might use a generic or 'Ham' for pork.
// Beef: CircleOff (placeholder for now, or maybe just text if icon missing)
const ICONS: Record<string, any> = {
  Veggie: Carrot,
  Beef: CircleOff, // Placeholder, usually we'd want a cow icon but Lucide is limited
  Pork: Ham,
  Chicken: Drumstick,
  Fish: Fish,
}

export function MeatTypeSelector({ value, onChange }: MeatTypeSelectorProps) {
  const selectedTypes = value || []
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInputVisible])

  const handleToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type))
    } else {
      onChange([...selectedTypes, type])
    }
  }

  const handleAddCustom = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !selectedTypes.includes(trimmed)) {
      onChange([...selectedTypes, trimmed])
    }
    setInputValue('')
    setIsInputVisible(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustom()
    } else if (e.key === 'Escape') {
      setInputValue('')
      setIsInputVisible(false)
    }
  }

  // Predefined types
  const predefined = PREDEFINED_MEAT_TYPES

  // Custom types (selected but not in predefined)
  const customSelected = selectedTypes.filter(
    t => !predefined.some(p => p.value === t)
  )

  return (
    <div className="flex flex-wrap gap-2">
      {/* Predefined Chips */}
      {predefined.map((option) => {
        const isSelected = selectedTypes.includes(option.value)
        const IconComponent = ICONS[option.value] || MoreHorizontal

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
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-100'
              }
            `}
          >
            <IconComponent className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        )
      })}

      {/* Custom Selected Chips */}
      {customSelected.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => handleToggle(type)}
          className="
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-150 ease-in-out
            border
            bg-rose-600 text-white border-rose-600
          "
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>{type}</span>
          <div className="ml-1 rounded-full bg-white/20 p-0.5 hover:bg-white/30">
             <X className="w-3 h-3" />
          </div>
        </button>
      ))}

      {/* "Other" Chip or Input */}
      {isInputVisible ? (
        <div className="inline-flex items-center h-[34px] px-3 rounded-full border border-rose-300 bg-white">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAddCustom}
            onKeyDown={handleKeyDown}
            className="outline-none bg-transparent text-sm text-rose-700 w-24 placeholder:text-rose-400"
            placeholder="Type..."
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsInputVisible(true)}
          className="
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-150 ease-in-out
            border border-dashed border-rose-400 text-rose-500 hover:text-rose-700 hover:border-rose-500 hover:bg-rose-50
          "
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>Other</span>
        </button>
      )}
    </div>
  )
}
