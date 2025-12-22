'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Icon from '@mdi/react'
import { mdiClose, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

interface ImageLightboxProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const minSwipeDistance = 50

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Navigation functions
  const navigateToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1))
  }

  const navigateToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  // Keyboard and focus management
  useEffect(() => {
    if (!isOpen) return

    // Save previous focus
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus close button when opened
    setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          navigateToPrevious()
          break
        case 'ArrowRight':
          navigateToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''

      // Restore focus when closed
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      navigateToNext()
    } else if (isRightSwipe) {
      navigateToPrevious()
    }
  }

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Content Container */}
      <div className="relative max-w-7xl w-full h-full flex items-center justify-center animate-slide-up">
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image gallery"
        >
          <Icon path={mdiClose} size={1} />
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous Arrow */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={navigateToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <Icon path={mdiChevronLeft} size={1} />
          </button>
        )}

        {/* Next Arrow */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={navigateToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <Icon path={mdiChevronRight} size={1} />
          </button>
        )}

        {/* Image Display */}
        <div
          className="relative w-full h-[80vh] max-h-[800px]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>
  )
}
