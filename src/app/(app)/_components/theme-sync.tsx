'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ThemeSync({ theme }: { theme: string }) {
  const { setTheme } = useTheme()
  // Solo sincroniza al montar (carga inicial desde DB).
  // No debe re-ejecutarse al cambiar setTheme para no pisar la selección del usuario.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setTheme(theme) }, [])
  return null
}
