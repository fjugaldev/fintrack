'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthLoginState {
  loading: boolean
  error: string | null
}

export function useAuthLogin() {
  const router = useRouter()
  const [state, setState] = useState<AuthLoginState>({ loading: false, error: null })

  async function signInWithEmail(email: string) {
    setState({ loading: true, error: null })

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      setState({ loading: false, error: error.message })
      return
    }

    setState({ loading: false, error: null })
    router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
  }

  async function signInWithGoogle() {
    setState({ loading: true, error: null })

    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    })

    if (error) {
      setState({ loading: false, error: error.message })
    }
    // En OAuth el navegador redirige — no hay que setState({ loading: false })
  }

  return { ...state, signInWithEmail, signInWithGoogle }
}
