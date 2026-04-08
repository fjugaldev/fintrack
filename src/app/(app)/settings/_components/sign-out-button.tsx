'use client'

import { useRouter } from 'next/navigation'
import { LogOutIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive w-fit" onClick={handleSignOut}>
      <LogOutIcon className="h-4 w-4" />
      Cerrar sesión
    </Button>
  )
}
