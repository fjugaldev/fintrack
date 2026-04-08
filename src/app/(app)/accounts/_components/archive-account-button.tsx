'use client'

import { useState } from 'react'
import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { archiveAccount } from '@/lib/db/actions/accounts.actions'

interface ArchiveAccountButtonProps {
  accountId: string
  accountName: string
}

export function ArchiveAccountButton({ accountId, accountName }: ArchiveAccountButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleArchive() {
    setIsLoading(true)
    try {
      await archiveAccount(accountId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors" />
        }
      >
        <Archive className="h-3.5 w-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Archivar cuenta?</AlertDialogTitle>
          <AlertDialogDescription>
            La cuenta <strong>{accountName}</strong> se ocultará de la lista. Tus transacciones
            históricas se conservarán y podrás reactivarla desde Configuración.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isLoading}>
            {isLoading ? 'Archivando...' : 'Archivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
