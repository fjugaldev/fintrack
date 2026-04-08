'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useOtpVerify } from '@/hooks/auth/use-otp-verify'

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')

  useEffect(() => {
    if (!email) router.replace('/auth/login')
  }, [email, router])

  if (!email) return null

  return <VerifyForm email={email} />
}

function VerifyForm({ email }: { email: string }) {
  const { loading, error, resendCooldown, verifyOtp, resendOtp } = useOtpVerify(email)

  function handleOtpChange(value: string) {
    if (value.length === 6) verifyOtp(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisa tu email</CardTitle>
        <CardDescription>
          Enviamos un código de 6 dígitos a{' '}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            onComplete={handleOtpChange}
            disabled={loading}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {loading && (
          <p className="text-center text-sm text-muted-foreground">Verificando...</p>
        )}

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={resendOtp}
            disabled={loading || resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Reenviar en ${resendCooldown}s`
              : '¿No recibiste el código? Reenviar'}
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Volver
        </Button>
      </CardContent>
    </Card>
  )
}
