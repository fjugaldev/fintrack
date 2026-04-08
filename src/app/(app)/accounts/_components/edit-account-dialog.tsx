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
import { AccountForm } from './account-form'
import { updateAccount } from '@/lib/db/actions/accounts.actions'
import type { FinancialAccount } from '@/lib/db/schema'
import type { AccountFormValues } from './account-form'

interface EditAccountDialogProps {
  account: FinancialAccount
  defaultCurrency?: string
}

export function EditAccountDialog({ account, defaultCurrency = 'USD' }: EditAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: AccountFormValues) {
    setIsLoading(true)
    try {
      await updateAccount(account.id, {
        name: data.name,
        type: data.type,
        color: data.color,
        currency: data.currency,
        exchangeRateToBase: data.currency !== defaultCurrency ? (data.exchangeRateToBase || null) : null,
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
          <DialogTitle>Editar cuenta</DialogTitle>
        </DialogHeader>
        <AccountForm
          defaultValues={{
            name: account.name,
            type: account.type,
            color: account.color,
            currency: account.currency,
            exchangeRateToBase: account.exchangeRateToBase ?? undefined,
          }}
          defaultCurrency={defaultCurrency}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  )
}
