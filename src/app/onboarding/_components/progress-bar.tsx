'use client'

interface ProgressBarProps {
  currentStep: 1 | 2
}

const STEPS = [
  { number: 1, label: 'Tu perfil' },
  { number: 2, label: 'Primera cuenta' },
]

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step, i) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-colors duration-200
                  ${currentStep > step.number
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.number
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span
                className={`
                  mt-1 text-xs font-medium
                  ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'}
                `}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-3 mt-[-16px] transition-colors duration-200
                  ${currentStep > step.number ? 'bg-primary' : 'bg-muted'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
