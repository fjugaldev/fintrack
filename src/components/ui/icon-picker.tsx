'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CATEGORY_ICONS, getCategoryIcon } from '@/lib/category-icons'
import { Tag } from 'lucide-react'

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
  color?: string
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  const SelectedIcon = getCategoryIcon(value)

  return (
    <Popover>
      <PopoverTrigger
        className="flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors cursor-pointer"
        style={{ color: color ?? undefined }}
        aria-label="Seleccionar ícono"
      >
        {SelectedIcon
          ? <SelectedIcon className="h-5 w-5" />
          : value
            ? <span className="text-lg leading-none">{value}</span>
            : <Tag className="h-5 w-5 text-muted-foreground" />}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
          {CATEGORY_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-muted ${
                value === name ? 'bg-muted ring-2 ring-foreground/30' : ''
              }`}
              style={{ color: value === name && color ? color : undefined }}
              title={name}
              aria-label={name}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
