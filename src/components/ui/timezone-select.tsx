'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ClockIcon, CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIMEZONES, findTimezone } from '@/lib/timezones'
import { Input } from '@/components/ui/input'

interface TimezoneSelectProps {
  value: string
  onChange: (tz: string) => void
  className?: string
}

// Agrupa timezones por región
function groupByRegion(timezones: typeof TIMEZONES) {
  const groups: Record<string, typeof TIMEZONES> = {}
  for (const tz of timezones) {
    groups[tz.region] ??= []
    groups[tz.region].push(tz)
  }
  return groups
}

export function TimezoneSelect({ value, onChange, className }: TimezoneSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = findTimezone(value)

  const filtered = useMemo(() => {
    if (!search.trim()) return TIMEZONES
    const q = search.toLowerCase()
    return TIMEZONES.filter(
      (tz) =>
        tz.label.toLowerCase().includes(q) ||
        tz.value.toLowerCase().includes(q) ||
        tz.offset.toLowerCase().includes(q) ||
        tz.region.toLowerCase().includes(q),
    )
  }, [search])

  const grouped = useMemo(() => groupByRegion(filtered), [filtered])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      // Enfocar el campo de búsqueda al abrir
      setTimeout(() => searchRef.current?.focus(), 50)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSelect(tz: string) {
    onChange(tz)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs',
          'hover:border-foreground/30 transition-colors',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring',
          open && 'border-ring ring-3 ring-ring/50',
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <ClockIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-left">
            {selected
              ? `${selected.label} (${selected.offset})`
              : value || 'Seleccionar zona horaria'}
          </span>
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[320px] rounded-lg border bg-popover shadow-md ring-1 ring-foreground/10">
          {/* Búsqueda */}
          <div className="p-2 border-b">
            <Input
              ref={searchRef}
              placeholder="Buscar ciudad o zona horaria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Lista */}
          <div className="max-h-64 overflow-y-auto p-1">
            {Object.keys(grouped).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </div>
            ) : (
              Object.entries(grouped).map(([region, tzs]) => (
                <div key={region}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {region}
                  </div>
                  {tzs.map((tz) => {
                    const isSelected = tz.value === value
                    return (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => handleSelect(tz.value)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <span className="text-left truncate">{tz.label}</span>
                        <span className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                          {tz.offset}
                          {isSelected && <CheckIcon className="h-3 w-3 text-primary" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
