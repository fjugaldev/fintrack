'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from './progress-bar'
import { StepProfile } from './step-profile'
import { StepFirstAccount } from './step-first-account'
import type { Profile } from '@/lib/db/schema'

interface OnboardingWizardProps {
  profile: Profile
}

export function OnboardingWizard({ profile }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [currency, setCurrency] = useState(profile.currency)
  const router = useRouter()

  function handleStep1Complete() {
    setCurrentStep(2)
  }

  function handleStep2Complete() {
    router.push('/dashboard')
  }

  // Paso 1 guarda currency en el profile; necesitamos pasarla al paso 2.
  // Usamos un wrapper para capturar el currency actualizado.
  function handleProfileNext(updatedCurrency?: string) {
    if (updatedCurrency) setCurrency(updatedCurrency)
    handleStep1Complete()
  }

  return (
    <div className="space-y-8">
      <ProgressBar currentStep={currentStep} />

      {currentStep === 1 && (
        <StepProfile
          profile={profile}
          onNext={handleStep1Complete}
        />
      )}

      {currentStep === 2 && (
        <StepFirstAccount
          currency={currency}
          onComplete={handleStep2Complete}
        />
      )}
    </div>
  )
}
