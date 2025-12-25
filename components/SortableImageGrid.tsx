'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ImageItem } from '@/types/session'
import { SortableImageItem } from './SortableImageItem'

interface SortableImageGridProps {
  items: ImageItem[]
  onReorder: (newOrder: ImageItem[]) => void
  onRemove: (id: string) => void
}

export function SortableImageGrid({ items, onReorder, onRemove }: SortableImageGridProps) {
  // Configure sensors for both mouse and touch
  // 5px activation distance prevents accidental drags while scrolling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newOrder = arrayMove(items, oldIndex, newIndex)
      onReorder(newOrder)
    }
  }

  // Only show drag handles if there's more than 1 image
  const showDragHandles = items.length > 1

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {items.map((item) => (
            <SortableImageItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              showDragHandle={showDragHandles}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
