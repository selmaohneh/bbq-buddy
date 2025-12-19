import { Flame, Fuel, Trees, Zap, CloudFog, MoreHorizontal } from 'lucide-react'

interface GrillTypeTagProps {
  type: string
  size?: 'sm' | 'md'
}

const ICONS: Record<string, any> = {
  Coal: Flame,
  Gas: Fuel,
  Wood: Trees,
  Electric: Zap,
  Smoke: CloudFog,
}

export function GrillTypeTag({ type, size = 'sm' }: GrillTypeTagProps) {
  const IconComponent = ICONS[type] || MoreHorizontal
  
  // Use a simpler mapping for custom types if needed, or just default icon.
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1 ${padding} rounded-full ${textSize} font-medium bg-slate-100 text-slate-700 border border-slate-200`}>
      <IconComponent className={iconSize} />
      <span>{type}</span>
    </span>
  )
}
