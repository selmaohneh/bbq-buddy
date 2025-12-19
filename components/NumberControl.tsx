'use client'

import { Minus, Plus } from 'lucide-react'

interface NumberControlProps {
  value: number
  onChange: (value: number) => void
  min?: number
}

export function NumberControl({ value, onChange, min = 1 }: NumberControlProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    onChange(value + 1)
  }

  const isAtMinimum = value <= min

  return (
    <div className="inline-flex items-center h-12 border border-border rounded-xl bg-foreground/5">
      {/* Decrease Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMinimum}
        className={`
          flex items-center justify-center w-12 h-12 rounded-l-xl
          transition-all duration-150
          ${isAtMinimum
            ? 'text-foreground/30 cursor-not-allowed'
            : 'text-primary hover:bg-primary/10 active:bg-primary/20'
          }
        `}
        aria-label="Decrease number of people"
      >
        <Minus className="w-5 h-5" />
      </button>

      {/* Value Display */}
      <div className="flex items-center justify-center min-w-[60px] px-4 text-center">
        <span className="text-lg font-semibold text-foreground">
          {value}
        </span>
      </div>

      {/* Increase Button */}
      <button
        type="button"
        onClick={handleIncrement}
        className="
          flex items-center justify-center w-12 h-12 rounded-r-xl
          text-primary hover:bg-primary/10 active:bg-primary/20
          transition-all duration-150
        "
        aria-label="Increase number of people"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}
