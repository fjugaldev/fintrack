'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { CurrencyInput } from '@/components/ui/currency-input'
import { addContribution } from '@/lib/db/actions/savings-goals.actions'

interface AddContributionDialogProps {
  goalId: string
  goalName: string
  currency: string
}

export function AddContributionDialog({ goalId, goalName, currency }: AddContributionDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('0')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setIsLoading(true)
    try {
      await addContribution(goalId, amount)
      setOpen(false)
      setAmount('0')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors" />
        }
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Añadir aporte
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Añadir aporte</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">{goalName}</p>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="contribution-amount">Monto a añadir</FieldLabel>
              <CurrencyInput
                id="contribution-amount"
                value={amount}
                onChange={setAmount}
                currency={currency}
              />
            </Field>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? 'Guardando...' : 'Confirmar'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
