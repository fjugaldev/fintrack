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
import { CategoryForm } from './category-form'
import { updateCategory } from '@/lib/db/actions/categories.actions'
import type { CategoryFormValues } from './category-form'
import type { Category } from '@/lib/db/schema'

interface EditCategoryDialogProps {
  category: Category
  parentCategories: Category[]
}

export function EditCategoryDialog({ category, parentCategories }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: CategoryFormValues) {
    setIsLoading(true)
    try {
      await updateCategory(category.id, {
        name: data.name,
        icon: data.icon || undefined,
        color: data.color || undefined,
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
          <DialogTitle>Editar categoría</DialogTitle>
        </DialogHeader>
        <CategoryForm
          parentCategories={parentCategories}
          lockType
          defaultValues={{
            name: category.name,
            type: category.type,
            icon: category.icon ?? '',
            color: category.color ?? '#6366f1',
            parentId: category.parentId,
          }}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  )
}
