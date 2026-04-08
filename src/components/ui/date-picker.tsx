'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'flex h-9 w-full items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs transition-colors',
          'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !value && 'text-muted-foreground',
          className,
        )}
      >
        <CalendarIcon className="size-4 shrink-0 opacity-60" />
        {value ? format(value, "d 'de' MMMM yyyy", { locale: es }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown"
          locale={es}
          defaultMonth={value}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
