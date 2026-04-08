'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteCategory } from '@/lib/db/actions/categories.actions'

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
}

export function DeleteCategoryButton({ categoryId, categoryName }: DeleteCategoryButtonProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setError(null)
    const result = await deleteCategory(categoryId)
    if (result.error) setError(result.error)
  }

  return (
    <AlertDialog onOpenChange={() => setError(null)}>
      <AlertDialogTrigger
        render={
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" />
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará <strong>{categoryName}</strong>. Las transacciones que la usen
            quedarán sin categoría. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-destructive px-1">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
