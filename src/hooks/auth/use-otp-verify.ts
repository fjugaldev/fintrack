'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface OtpVerifyState {
  loading: boolean
  error: string | null
  resendCooldown: number // segundos restantes para poder reenviar
}

export function useOtpVerify(email: string) {
  const router = useRouter()
  const [state, setState] = useState<OtpVerifyState>({
    loading: false,
    error: null,
    resendCooldown: 0,
  })

  async function verifyOtp(token: string) {
    if (token.length !== 6) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: 'Código inválido o expirado. Intenta de nuevo.' }))
      return
    }

    router.push('/dashboard')
  }

  const resendOtp = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return
    }

    // Iniciar cooldown de 60 segundos
    setState((prev) => ({ ...prev, loading: false, resendCooldown: 60 }))

    const interval = setInterval(() => {
      setState((prev) => {
        const next = prev.resendCooldown - 1
        if (next <= 0) {
          clearInterval(interval)
          return { ...prev, resendCooldown: 0 }
        }
        return { ...prev, resendCooldown: next }
      })
    }, 1000)
  }, [email])

  return { ...state, verifyOtp, resendOtp }
}
