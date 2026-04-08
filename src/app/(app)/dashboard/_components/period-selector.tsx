'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface PeriodSelectorProps {
  currentMonth: string
}

export function PeriodSelector({ currentMonth }: PeriodSelectorProps) {
  const router = useRouter()
  const isCurrentMonth = currentMonth >= getCurrentMonth()

  const displayLabel = new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentMonth + '-02')) // día 2 para evitar desfases de TZ

  function go(delta: number) {
    router.push(`/dashboard?month=${shiftMonth(currentMonth, delta)}`)
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => go(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium w-32 text-center capitalize">
        {displayLabel}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={isCurrentMonth}
        onClick={() => go(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
