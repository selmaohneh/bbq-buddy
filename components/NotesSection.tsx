'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Save, FileText } from 'lucide-react'

interface NotesSectionProps {
  value: string
  onChange: (value: string) => void
}

export function NotesSection({ value, onChange }: NotesSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const openEditor = () => {
    setTempValue(value)
    setIsEditing(true)
    dialogRef.current?.showModal()
  }

  const closeEditor = () => {
    setIsEditing(false)
    dialogRef.current?.close()
  }

  const handleSave = () => {
    onChange(tempValue)
    closeEditor()
  }

  // Handle click outside to close (optional, but good UX for standard modals)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeEditor()
    }
  }

  return (
    <>
      {/* Read-only / Preview Area */}
      <button
        type="button"
        onClick={openEditor}
        className="w-full text-left group"
      >
        <div className={`
          p-4 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-2
          ${value 
            ? 'bg-foreground/5 border-foreground/20 text-foreground/80 hover:border-primary hover:bg-foreground/10' 
            : 'bg-transparent border-foreground/20 text-foreground/60 hover:border-primary hover:text-primary'
          }
        `}>
          <FileText className="w-6 h-6 shrink-0" />
          <div className="flex-1 whitespace-pre-wrap break-words overflow-hidden font-medium">
            {value || 'Add any notes about your session...'}
          </div>
        </div>
      </button>

      {/* Edit Modal */}
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="
          backdrop:bg-black/50 backdrop:backdrop-blur-sm
          bg-white rounded-2xl shadow-xl w-full max-w-lg p-0
          m-auto open:animate-in open:fade-in open:zoom-in-95
        "
      >
        <div className="flex flex-col h-[60vh] sm:h-auto max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Session Notes</h3>
            <button
              type="button"
              onClick={closeEditor}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 p-4">
            <textarea
              ref={textareaRef}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full h-full min-h-[200px] resize-none outline-none text-base text-slate-700 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditor}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Notes
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
