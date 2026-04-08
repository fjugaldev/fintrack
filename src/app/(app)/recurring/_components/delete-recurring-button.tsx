'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
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
import { deleteRecurringTransaction } from '@/lib/db/actions/recurring.actions'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function DeleteRecurringButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteRecurringTransaction(id)
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
                <button className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-accent transition-colors" />
              }
            />
          }
        >
          <Trash2 className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Eliminar</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar transacción recurrente?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará la regla recurrente. Las transacciones ya aplicadas no se ven afectadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} variant="destructive">
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
