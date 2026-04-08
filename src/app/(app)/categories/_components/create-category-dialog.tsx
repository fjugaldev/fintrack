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
import { CategoryForm } from './category-form'
import { createCategory } from '@/lib/db/actions/categories.actions'
import type { CategoryFormValues } from './category-form'
import type { Category } from '@/lib/db/schema'

interface CreateCategoryDialogProps {
  parentCategories: Category[]
  // Si se pasa, el dialog crea directamente una subcategoría de este padre
  defaultParentId?: string
  defaultType?: 'income' | 'expense'
}

export function CreateCategoryDialog({
  parentCategories,
  defaultParentId,
  defaultType,
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: CategoryFormValues) {
    setIsLoading(true)
    try {
      await createCategory({
        name: data.name,
        type: data.type,
        icon: data.icon || undefined,
        color: data.color || undefined,
        parentId: data.parentId,
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
        Nueva categoría
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
        </DialogHeader>
        <CategoryForm
          parentCategories={parentCategories}
          fixedParentId={defaultParentId}
          defaultValues={{ type: defaultType ?? 'expense', parentId: defaultParentId }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Crear categoría"
        />
      </DialogContent>
    </Dialog>
  )
}
