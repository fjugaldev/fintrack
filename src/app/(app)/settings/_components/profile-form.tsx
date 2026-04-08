'use client'

import { useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { updateProfilePreferences } from '@/lib/db/actions/profile.actions'
import { CURRENCIES } from '@/lib/currencies'
import type { Profile } from '@/lib/db/schema'

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.fullName ?? '')
  const [currency, setCurrency] = useState(profile.currency)
  const [timezone, setTimezone] = useState(profile.timezone)
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateProfilePreferences({ fullName: fullName.trim(), currency, timezone })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
          <Input
            id="fullName"
            placeholder="Ej: María García"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
          <FieldDescription>
            Moneda usada para el dashboard y los totales consolidados.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Zona horaria</FieldLabel>
          <TimezoneSelect value={timezone} onChange={setTimezone} />
        </Field>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-fit"
        >
          {saved ? (
            <><CheckIcon className="h-4 w-4" /> Guardado</>
          ) : isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </FieldGroup>
    </form>
  )
}
