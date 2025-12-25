'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { ImageItem } from '@/types/session'

interface SortableImageItemProps {
  item: ImageItem
  onRemove: (id: string) => void
  showDragHandle: boolean
}

export function SortableImageItem({ item, onRemove, showDragHandle }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden bg-input ${
        isDragging ? 'opacity-50 scale-105 shadow-xl z-50' : ''
      }`}
    >
      <Image
        src={item.url}
        alt={item.type === 'new' ? 'New image' : 'Session image'}
        fill
        className="object-cover"
        unoptimized={item.type === 'new'} // Blob URLs need unoptimized
      />

      {/* Drag Handle - Top Left */}
      {showDragHandle && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 bg-black/50 text-white rounded-full p-2 cursor-grab active:cursor-grabbing touch-none hover:bg-black/70 transition-colors"
          aria-label="Drag to reorder image"
        >
          {/* 6-dot grip icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M9 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm9-13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          </svg>
        </button>
      )}

      {/* New Badge - Bottom Left */}
      {item.type === 'new' && (
        <div className="absolute bottom-1 left-1 bg-green-500/80 text-white text-[10px] px-1 rounded">
          New
        </div>
      )}

      {/* Remove Button - Top Right */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
        aria-label="Remove image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
