'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateTheme } from '@/lib/db/actions/profile.actions'

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: SunIcon },
  { value: 'dark', label: 'Oscuro', icon: MoonIcon },
  { value: 'system', label: 'Sistema', icon: MonitorIcon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => { setTheme(value); updateTheme(value) }}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border px-5 py-3 text-sm transition-colors',
            mounted && theme === value
              ? 'border-primary bg-primary/5 text-primary font-medium'
              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  )
}
