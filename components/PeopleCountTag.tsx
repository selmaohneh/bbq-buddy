import Icon from '@mdi/react'
import { mdiAccountGroup } from '@mdi/js'

interface PeopleCountTagProps {
  count: number
}

export function PeopleCountTag({ count }: PeopleCountTagProps) {
  return (
    <div className="inline-flex items-center gap-1 text-xs text-foreground/60">
      <Icon path={mdiAccountGroup} size={0.55} className="w-3.5 h-3.5" />
      <span className="font-medium">{count}</span>
    </div>
  )
}
