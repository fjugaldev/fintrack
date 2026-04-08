'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { toggleRecurringActive } from '@/lib/db/actions/recurring.actions'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface ToggleActiveButtonProps {
  id: string
  isActive: boolean
}

export function ToggleActiveButton({ id, isActive }: ToggleActiveButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await toggleRecurringActive(id, !isActive)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={handleToggle}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          />
        }
      >
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </TooltipTrigger>
      <TooltipContent>{isActive ? 'Pausar' : 'Reanudar'}</TooltipContent>
    </Tooltip>
  )
}
