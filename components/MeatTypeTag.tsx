import Icon from '@mdi/react'
import { mdiCarrot, mdiFoodDrumstick, mdiFish, mdiPig, mdiCow, mdiDotsHorizontal } from '@mdi/js'

interface MeatTypeTagProps {
  type: string
  size?: 'sm' | 'md'
  showText?: boolean
}

const ICON_PATHS: Record<string, string> = {
  Veggie: mdiCarrot,
  Beef: mdiCow,
  Pork: mdiPig,
  Chicken: mdiFoodDrumstick,
  Fish: mdiFish,
}

export function MeatTypeTag({ type, size = 'sm', showText = true }: MeatTypeTagProps) {
  const iconPath = ICON_PATHS[type] || mdiDotsHorizontal
  
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
      <Icon path={iconPath} size={size === 'sm' ? 0.5 : 0.6} className={iconSize} />
      {showText && <span>{type}</span>}
    </span>
  )
}
