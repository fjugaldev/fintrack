import Image from 'next/image'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo-fintrack.png"
            alt="FinTrack"
            width={180}
            height={52}
            priority
          />
        </div>
        {children}
      </div>
    </div>
  )
}
