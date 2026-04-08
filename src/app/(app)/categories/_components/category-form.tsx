'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
import { ACCOUNT_COLORS } from '@/lib/account-types'
import { IconPicker } from '@/components/ui/icon-picker'
import { getCategoryIcon } from '@/lib/category-icons'
import type { Category } from '@/lib/db/schema'

export type CategoryFormValues = {
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  parentId?: string | null
}

interface CategoryFormProps {
  // Categorías padre disponibles para asignar como padre (solo las que no son subcategorías)
  parentCategories: Category[]
  defaultValues?: Partial<CategoryFormValues>
  // Si se edita, el tipo no cambia
  lockType?: boolean
  // Si se crea dentro de un padre, parentId fijo
  fixedParentId?: string
  isLoading?: boolean
  onSubmit: (data: CategoryFormValues) => Promise<void>
  submitLabel?: string
}

export function CategoryForm({
  parentCategories,
  defaultValues,
  lockType = false,
  fixedParentId,
  isLoading = false,
  onSubmit,
  submitLabel = 'Guardar',
}: CategoryFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [type, setType] = useState<'income' | 'expense'>(defaultValues?.type ?? 'expense')
  const [icon, setIcon] = useState(defaultValues?.icon ?? '')
  const [color, setColor] = useState(defaultValues?.color ?? ACCOUNT_COLORS[0])
  const [parentId, setParentId] = useState<string>(
    fixedParentId ?? defaultValues?.parentId ?? 'none',
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit({
      name: name.trim(),
      type,
      icon,
      color,
      parentId: parentId === 'none' ? null : parentId,
    })
  }

  // Si hay padre seleccionado, el tipo se hereda (bloqueado)
  const hasParent = parentId !== 'none'
  const selectedParent = parentCategories.find((c) => c.id === parentId)
  const effectiveType = hasParent && selectedParent ? selectedParent.type : type

  // Filtrar padres por tipo cuando el tipo está libre
  const availableParents = lockType
    ? parentCategories.filter((c) => c.type === defaultValues?.type)
    : parentCategories.filter((c) => c.type === effectiveType)

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Tipo */}
        {!lockType && !fixedParentId && (
          <Field>
            <FieldLabel>Tipo</FieldLabel>
            <ToggleGroup
              variant="outline"
              spacing={2}
              className="w-full grid grid-cols-2"
              value={[hasParent ? effectiveType : type]}
              onValueChange={(values) => {
                if (hasParent) return
                const next = values.find((v) => v !== type) as 'income' | 'expense' | undefined
                if (next) { setType(next); setParentId('none') }
              }}
            >
              <ToggleGroupItem value="expense" className="cursor-pointer" disabled={hasParent}>
                Gasto
              </ToggleGroupItem>
              <ToggleGroupItem value="income" className="cursor-pointer" disabled={hasParent}>
                Ingreso
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        )}

        {/* Categoría padre (solo al crear, sin fixedParentId) */}
        {!fixedParentId && !lockType && (
          <Field>
            <FieldLabel htmlFor="cat-parent">Subcategoría de (opcional)</FieldLabel>
            <Select value={parentId} onValueChange={(v) => v && setParentId(v)}>
              <SelectTrigger id="cat-parent">
                <SelectValue>
                  {parentId === 'none'
                    ? 'Ninguna (categoría principal)'
                    : selectedParent
                      ? (() => {
                          const ParentIcon = getCategoryIcon(selectedParent.icon)
                          return (
                            <span className="flex items-center gap-2">
                              {ParentIcon
                                ? <ParentIcon className="h-4 w-4" />
                                : selectedParent.icon
                                  ? <span className="text-sm">{selectedParent.icon}</span>
                                  : null}
                              {selectedParent.name}
                            </span>
                          )
                        })()
                      : '—'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categoría padre</SelectLabel>
                  <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                  {availableParents.map((c) => {
                    const ParIcon = getCategoryIcon(c.icon)
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          {ParIcon
                            ? <ParIcon className="h-4 w-4" />
                            : c.icon
                              ? <span className="text-sm">{c.icon}</span>
                              : null}
                          {c.name}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        {/* Nombre */}
        <Field>
          <FieldLabel htmlFor="cat-name">Nombre</FieldLabel>
          <Input
            id="cat-name"
            placeholder="Ej: Supermercado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        {/* Ícono */}
        <Field>
          <FieldLabel>Ícono</FieldLabel>
          <IconPicker value={icon} onChange={setIcon} color={color} />
        </Field>

        {/* Color */}
        <Field>
          <FieldLabel>Color</FieldLabel>
          <div className="flex gap-2 flex-wrap">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-7 rounded-full border-2 transition-transform cursor-pointer ${
                  color === c ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>

        <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
          {isLoading ? 'Guardando...' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
