import Icon from '@mdi/react'
import { mdiGrill, mdiGasCylinder, mdiCampfire, mdiLightningBolt, mdiSmoke, mdiDotsHorizontal } from '@mdi/js'

interface GrillTypeTagProps {
  type: string
  size?: 'sm' | 'md'
  showText?: boolean
}

const ICON_PATHS: Record<string, string> = {
  Coal: mdiGrill,
  Gas: mdiGasCylinder,
  Wood: mdiCampfire,
  Electric: mdiLightningBolt,
  Smoke: mdiSmoke,
}

export function GrillTypeTag({ type, size = 'sm', showText = true }: GrillTypeTagProps) {
  const iconPath = ICON_PATHS[type] || mdiDotsHorizontal
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const padding = showText 
    ? (size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1')
    : (size === 'sm' ? 'p-1' : 'p-1.5')

  return (
    <span 
      className={`inline-flex items-center gap-1 ${padding} rounded-full ${textSize} font-medium bg-slate-100 text-slate-700 border border-slate-200`}
      title={!showText ? type : undefined}
    >
      <Icon path={iconPath} size={size === 'sm' ? 0.5 : 0.6} className={iconSize} />
      {showText && <span>{type}</span>}
    </span>
  )
}