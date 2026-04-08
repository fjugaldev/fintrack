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
import { GoalForm } from './goal-form'
import { createSavingsGoal } from '@/lib/db/actions/savings-goals.actions'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { GoalFormValues } from './goal-form'

interface CreateGoalDialogProps {
  accounts: FinancialAccount[]
  incomeCategories: Pick<Category, 'id' | 'name' | 'icon' | 'color'>[]
  currency: string
}

export function CreateGoalDialog({ accounts, incomeCategories, currency }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: GoalFormValues) {
    setIsLoading(true)
    try {
      await createSavingsGoal({
        ...data,
        categoryId: data.categoryId,
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
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" />
        }
      >
        <Plus className="h-4 w-4" />
        Nueva meta
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva meta de ahorro</DialogTitle>
        </DialogHeader>
        <GoalForm
          accounts={accounts}
          incomeCategories={incomeCategories}
          currency={currency}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Crear meta"
        />
      </DialogContent>
    </Dialog>
  )
}
