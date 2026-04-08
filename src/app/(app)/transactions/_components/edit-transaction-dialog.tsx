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
import { TransactionForm } from './transaction-form'
import { updateTransaction } from '@/lib/db/actions/transactions.actions'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { TransactionWithRelations } from '@/lib/db/actions/transactions.actions'
import type { TransactionFormValues } from './transaction-form'

interface EditTransactionDialogProps {
  transaction: TransactionWithRelations
  accounts: FinancialAccount[]
  categories: Category[]
}

export function EditTransactionDialog({ transaction, accounts, categories }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Las transferencias crean 2 registros vinculados; editar solo actualiza descripción/fecha/monto de ambas lados
  const defaultType = transaction.isTransfer ? 'transfer' : transaction.type

  async function handleSubmit(data: TransactionFormValues) {
    setIsLoading(true)
    try {
      // Para transferencias, pasamos el tipo original (expense del origen)
      await updateTransaction(transaction.id, {
        ...data,
        type: transaction.isTransfer ? transaction.type : (data.type as 'income' | 'expense'),
      })
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar transacción</DialogTitle>
        </DialogHeader>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          defaultValues={{
            type: defaultType,
            amount: transaction.amount,
            date: transaction.date,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId ?? undefined,
            description: transaction.description ?? undefined,
            merchant: transaction.merchant ?? undefined,
            notes: transaction.notes ?? undefined,
          }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  )
}
