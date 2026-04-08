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
import { BudgetForm } from './budget-form'
import { updateBudget } from '@/lib/db/actions/budgets.actions'
import type { Category } from '@/lib/db/schema'
import type { BudgetWithSpent } from '@/lib/db/actions/budgets.actions'
import type { BudgetFormValues } from './budget-form'

interface EditBudgetDialogProps {
  budget: BudgetWithSpent
  categories: Category[]
  currency: string
}

export function EditBudgetDialog({ budget, categories, currency }: EditBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: BudgetFormValues) {
    setIsLoading(true)
    try {
      await updateBudget(budget.id, data)
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar presupuesto</DialogTitle>
        </DialogHeader>
        <BudgetForm
          categories={categories}
          currency={currency}
          defaultValues={{
            categoryId: budget.categoryId ?? 'global',
            limitAmount: budget.limitAmount,
            period: budget.period,
          }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  )
}
