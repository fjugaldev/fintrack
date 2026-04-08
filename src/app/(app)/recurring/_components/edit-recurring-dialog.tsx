'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RecurringForm } from './recurring-form'
import { updateRecurringTransaction } from '@/lib/db/actions/recurring.actions'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { RecurringWithRelations, RecurringFormData } from '@/lib/db/actions/recurring.actions'

interface EditRecurringDialogProps {
  recurring: RecurringWithRelations
  accounts: FinancialAccount[]
  categories: Category[]
}

export function EditRecurringDialog({ recurring, accounts, categories }: EditRecurringDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: RecurringFormData) {
    setIsLoading(true)
    try {
      await updateRecurringTransaction(recurring.id, data)
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <button className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />
              }
            />
          }
        >
          <Pencil className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar transacción recurrente</DialogTitle>
        </DialogHeader>
        <RecurringForm
          accounts={accounts}
          categories={categories}
          defaultValues={{
            accountId: recurring.accountId,
            categoryId: recurring.categoryId,
            amount: recurring.amount,
            type: recurring.type,
            description: recurring.description,
            frequency: recurring.frequency,
            nextDueDate: recurring.nextDueDate,
          }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  )
}
