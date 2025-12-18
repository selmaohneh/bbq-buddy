"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function ClientToaster() {
  const { theme = "system" } = useTheme()
  
  return (
    <Toaster 
      theme={theme as "light" | "dark" | "system"} 
      richColors 
      closeButton
      position="bottom-center"
    />
  )
}
