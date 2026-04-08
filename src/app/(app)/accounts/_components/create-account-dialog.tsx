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
import { AccountForm } from './account-form'
import { createFinancialAccount } from '@/lib/db/actions/accounts.actions'
import type { AccountFormValues } from './account-form'

interface CreateAccountDialogProps {
  currency: string
}

export function CreateAccountDialog({ currency }: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: AccountFormValues) {
    setIsLoading(true)
    try {
      await createFinancialAccount({
        name: data.name,
        type: data.type,
        color: data.color,
        balance: data.balance ?? '0',
        currency: data.currency ?? currency,
        exchangeRateToBase: data.exchangeRateToBase,
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
        Nueva cuenta
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva cuenta</DialogTitle>
        </DialogHeader>
        <AccountForm
          defaultCurrency={currency}
          showBalance
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Crear cuenta"
        />
      </DialogContent>
    </Dialog>
  )
}
