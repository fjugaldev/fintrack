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
import { BudgetForm } from './budget-form'
import { createBudget } from '@/lib/db/actions/budgets.actions'
import type { Category } from '@/lib/db/schema'
import type { BudgetFormValues } from './budget-form'

interface CreateBudgetDialogProps {
  categories: Category[]
  currency: string
  defaultPeriod?: 'monthly' | 'yearly'
}

export function CreateBudgetDialog({ categories, currency, defaultPeriod = 'monthly' }: CreateBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: BudgetFormValues) {
    setIsLoading(true)
    try {
      await createBudget(data)
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
        Nuevo presupuesto
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo presupuesto</DialogTitle>
        </DialogHeader>
        <BudgetForm
          categories={categories}
          currency={currency}
          defaultValues={{ period: defaultPeriod }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Crear presupuesto"
        />
      </DialogContent>
    </Dialog>
  )
}
