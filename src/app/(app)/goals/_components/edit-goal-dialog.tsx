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
import { GoalForm } from './goal-form'
import { updateSavingsGoal } from '@/lib/db/actions/savings-goals.actions'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { SavingsGoalWithAccount } from '@/lib/db/actions/savings-goals.actions'
import type { GoalFormValues } from './goal-form'

interface EditGoalDialogProps {
  goal: SavingsGoalWithAccount
  accounts: FinancialAccount[]
  incomeCategories: Pick<Category, 'id' | 'name' | 'icon' | 'color'>[]
  currency: string
}

export function EditGoalDialog({ goal, accounts, incomeCategories, currency }: EditGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: GoalFormValues) {
    setIsLoading(true)
    try {
      await updateSavingsGoal(goal.id, {
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
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar meta</DialogTitle>
        </DialogHeader>
        <GoalForm
          accounts={accounts}
          incomeCategories={incomeCategories}
          currency={currency}
          defaultValues={{
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            targetDate: goal.targetDate ?? undefined,
            accountId: goal.accountId ?? undefined,
            categoryId: goal.categoryId ?? undefined,
          }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  )
}
