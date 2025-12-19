import { Gem, Fuel, Trees, Zap, AlarmSmoke, MoreHorizontal } from 'lucide-react'

interface GrillTypeTagProps {
  type: string
  size?: 'sm' | 'md'
  showText?: boolean
}

const ICONS: Record<string, any> = {
  Coal: Gem,
  Gas: Fuel,
  Wood: Trees,
  Electric: Zap,
  Smoke: AlarmSmoke,
}

export function GrillTypeTag({ type, size = 'sm', showText = true }: GrillTypeTagProps) {
  const IconComponent = ICONS[type] || MoreHorizontal
  
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
      <IconComponent className={iconSize} />
      {showText && <span>{type}</span>}
    </span>
  )
}