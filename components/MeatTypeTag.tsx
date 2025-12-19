import { Carrot, Drumstick, Fish, Ham, MoreHorizontal, CircleOff } from 'lucide-react'

interface MeatTypeTagProps {
  type: string
  size?: 'sm' | 'md'
  showText?: boolean
}

const ICONS: Record<string, any> = {
  Veggie: Carrot,
  Beef: CircleOff,
  Pork: Ham,
  Chicken: Drumstick,
  Fish: Fish,
}

export function MeatTypeTag({ type, size = 'sm', showText = true }: MeatTypeTagProps) {
  const IconComponent = ICONS[type] || MoreHorizontal
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const padding = showText 
    ? (size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1')
    : (size === 'sm' ? 'p-1' : 'p-1.5')

  return (
    <span 
      className={`inline-flex items-center gap-1 ${padding} rounded-full ${textSize} font-medium bg-rose-100 text-rose-700 border border-rose-200`}
      title={!showText ? type : undefined}
    >
      <IconComponent className={iconSize} />
      {showText && <span>{type}</span>}
    </span>
  )
}
