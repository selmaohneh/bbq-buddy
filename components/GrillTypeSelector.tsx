'use client'

import { useState, useRef, useEffect } from 'react'
import { PREDEFINED_GRILL_TYPES } from '@/types/session'
import { Gem, Fuel, Trees, Zap, AlarmSmoke, MoreHorizontal, X } from 'lucide-react'

interface GrillTypeSelectorProps {
  value: string[] | null
  onChange: (value: string[]) => void
}

const ICONS: Record<string, any> = {
  Coal: Gem,
  Gas: Fuel,
  Wood: Trees,
  Electric: Zap,
  Smoke: AlarmSmoke,
}

export function GrillTypeSelector({ value, onChange }: GrillTypeSelectorProps) {
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
  const predefined = PREDEFINED_GRILL_TYPES

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
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
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
            bg-slate-700 text-white border-slate-700
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
        <div className="inline-flex items-center h-[34px] px-3 rounded-full border border-slate-300 bg-white">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAddCustom}
            onKeyDown={handleKeyDown}
            className="outline-none bg-transparent text-sm text-slate-700 w-24 placeholder:text-slate-400"
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
            border border-dashed border-slate-400 text-slate-500 hover:text-slate-700 hover:border-slate-500 hover:bg-slate-50
          "
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>Other</span>
        </button>
      )}
    </div>
  )
}
