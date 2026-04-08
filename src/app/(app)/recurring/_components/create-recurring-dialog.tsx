'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RecurringForm } from './recurring-form'
import { createRecurringTransaction } from '@/lib/db/actions/recurring.actions'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { RecurringFormData } from '@/lib/db/actions/recurring.actions'

interface CreateRecurringDialogProps {
  accounts: FinancialAccount[]
  categories: Category[]
}

export function CreateRecurringDialog({ accounts, categories }: CreateRecurringDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: RecurringFormData) {
    setIsLoading(true)
    try {
      await createRecurringTransaction(data)
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" />
        }
      >
        <Plus className="h-4 w-4" />
        Nueva recurrente
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva transacción recurrente</DialogTitle>
        </DialogHeader>
        <RecurringForm
          accounts={accounts}
          categories={categories}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Crear"
        />
      </DialogContent>
    </Dialog>
  )
}
