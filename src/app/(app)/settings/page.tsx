import { getProfile } from '@/lib/db/actions/profile.actions'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './_components/profile-form'
import { ThemeToggle } from './_components/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { SignOutButton } from './_components/sign-out-button'

export default async function SettingsPage() {
  const [profile, supabase] = await Promise.all([
    getProfile(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  if (!profile) return null

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajusta tu perfil y preferencias.</p>
      </div>

      {/* Perfil */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Perfil</h2>
          <p className="text-sm text-muted-foreground">Tu nombre, moneda y zona horaria.</p>
        </div>
        <ProfileForm profile={profile} />
      </section>

      <Separator />

      {/* Apariencia */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Apariencia</h2>
          <p className="text-sm text-muted-foreground">Elige cómo se ve la aplicación.</p>
        </div>
        <ThemeToggle />
      </section>

      <Separator />

      {/* Cuenta */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Cuenta</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <SignOutButton />
      </section>
    </div>
  )
}
