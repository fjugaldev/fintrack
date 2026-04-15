import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { OnboardingWizard } from './_components/onboarding-wizard'

export default async function OnboardingPage() {
  const profile = await getProfile()

  if (!profile) redirect('/auth/login')
  if (profile.onboardingCompleted) redirect('/')

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Bienvenido a FinTrack</h1>
          <p className="text-muted-foreground mt-2">
            Configura tu cuenta en 2 pasos para empezar.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <OnboardingWizard profile={profile} />
        </div>
      </div>
    </main>
  )
}
