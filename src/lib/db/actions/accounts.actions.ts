'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { financialAccounts } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import type { NewFinancialAccount } from '@/lib/db/schema'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

export async function getAccounts() {
  const profileId = await getAuthUserId()
  return db.query.financialAccounts.findMany({
    where: and(
      eq(financialAccounts.profileId, profileId),
      eq(financialAccounts.isArchived, false),
    ),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  })
}

export async function createFinancialAccount(data: {
  name: string
  type: NewFinancialAccount['type']
  color: string
  balance: string
  currency: string
  exchangeRateToBase?: string
}) {
  const profileId = await getAuthUserId()
  const [account] = await db
    .insert(financialAccounts)
    .values({
      profileId,
      name: data.name,
      type: data.type,
      color: data.color,
      balance: data.balance,
      currency: data.currency,
      exchangeRateToBase: data.exchangeRateToBase || null,
    })
    .returning()
  revalidatePath('/accounts')
  return account
}

export async function updateAccount(
  id: string,
  data: { name: string; color: string; type: NewFinancialAccount['type']; currency?: string; exchangeRateToBase?: string | null },
) {
  const profileId = await getAuthUserId()
  const [account] = await db
    .update(financialAccounts)
    .set({
      name: data.name,
      color: data.color,
      type: data.type,
      ...(data.currency ? { currency: data.currency } : {}),
      exchangeRateToBase: data.exchangeRateToBase ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(financialAccounts.id, id), eq(financialAccounts.profileId, profileId)))
    .returning()
  revalidatePath('/accounts')
  return account
}

export async function archiveAccount(id: string) {
  const profileId = await getAuthUserId()
  await db
    .update(financialAccounts)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(and(eq(financialAccounts.id, id), eq(financialAccounts.profileId, profileId)))
  revalidatePath('/accounts')
}
