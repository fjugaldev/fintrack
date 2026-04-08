'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

export async function getProfile() {
  const userId = await getAuthUserId()
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })
  return profile ?? null
}

export async function updateProfilePreferences(data: {
  fullName: string
  currency: string
  timezone: string
}) {
  const userId = await getAuthUserId()
  await db
    .update(profiles)
    .set({
      fullName: data.fullName,
      currency: data.currency,
      timezone: data.timezone,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateTheme(theme: string) {
  const userId = await getAuthUserId()
  await db
    .update(profiles)
    .set({ theme, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
}

export async function completeOnboarding() {
  const userId = await getAuthUserId()
  await db
    .update(profiles)
    .set({ onboardingCompleted: true, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
}
