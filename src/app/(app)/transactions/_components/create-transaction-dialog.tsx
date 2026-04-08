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
import { TransactionForm } from './transaction-form'
import { createTransaction } from '@/lib/db/actions/transactions.actions'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { TransactionFormValues } from './transaction-form'

interface CreateTransactionDialogProps {
  accounts: FinancialAccount[]
  categories: Category[]
}

export function CreateTransactionDialog({ accounts, categories }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: TransactionFormValues) {
    setIsLoading(true)
    try {
      await createTransaction(data)
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
        Nueva transacción
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva transacción</DialogTitle>
        </DialogHeader>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Registrar"
        />
      </DialogContent>
    </Dialog>
  )
}
