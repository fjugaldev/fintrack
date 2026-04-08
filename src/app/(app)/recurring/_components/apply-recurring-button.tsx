'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { applyRecurringTransaction } from '@/lib/db/actions/recurring.actions'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface ApplyRecurringButtonProps {
  id: string
  description: string | null
  isDue: boolean
}

export function ApplyRecurringButton({ id, description, isDue }: ApplyRecurringButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleApply() {
    setIsLoading(true)
    try {
      await applyRecurringTransaction(id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger
          render={
            <AlertDialogTrigger
              render={
                <button
                  className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                    isDue
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                />
              }
            />
          }
        >
          <Play className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{isDue ? 'Aplicar (vencida)' : 'Aplicar ahora'}</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Aplicar ahora?</AlertDialogTitle>
          <AlertDialogDescription>
            Se creará una transacción para <strong>{description ?? 'esta recurrente'}</strong> con
            la fecha de hoy y se actualizará el balance de la cuenta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleApply} disabled={isLoading}>
            {isLoading ? 'Aplicando...' : 'Aplicar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
