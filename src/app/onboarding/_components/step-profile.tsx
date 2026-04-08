'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { updateProfilePreferences } from '@/lib/db/actions/profile.actions'
import { CURRENCIES } from '@/lib/currencies'
import type { Profile } from '@/lib/db/schema'

interface StepProfileProps {
  profile: Profile
  onNext: () => void
}

export function StepProfile({ profile, onNext }: StepProfileProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? '')
  const [currency, setCurrency] = useState(profile.currency)
  const [timezone, setTimezone] = useState(
    profile.timezone !== 'UTC'
      ? profile.timezone
      : typeof window !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : 'America/New_York',
  )
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setIsLoading(true)
    try {
      await updateProfilePreferences({ fullName: fullName.trim(), currency, timezone })
      onNext()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Cuéntanos sobre ti</h2>
          <p className="text-sm text-muted-foreground">
            Estos datos personalizan tu experiencia en FinTrack.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
            <Input
              id="fullName"
              placeholder="Ej: María García"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="currency">Moneda principal</FieldLabel>
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger id="currency">
                <SelectValue>
                  {CURRENCIES.find((c) => c.code === currency)?.label ?? currency}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Moneda</SelectLabel>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Zona horaria</FieldLabel>
            <TimezoneSelect value={timezone} onChange={setTimezone} />
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isLoading || !fullName.trim()}>
          {isLoading ? 'Guardando...' : 'Continuar'}
        </Button>
      </div>
    </form>
  )
}
