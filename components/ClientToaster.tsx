"use client"

import { Toaster } from "sonner"

export function ClientToaster() {
  return (
    <Toaster
      theme="dark"
      richColors
      closeButton
      position="bottom-center"
    />
  )
}
