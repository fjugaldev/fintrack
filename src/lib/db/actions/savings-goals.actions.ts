'use server'

import { and, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { savingsGoals, financialAccounts, transactions, categories } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import type { SavingsGoal, FinancialAccount, Category } from '@/lib/db/schema'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

export type SavingsGoalWithAccount = SavingsGoal & {
  account: Pick<FinancialAccount, 'id' | 'name' | 'currency'> | null
  filterCategory: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
  percentage: number
  remaining: number
  isAutoTracked: boolean
}

export async function getSavingsGoals(): Promise<SavingsGoalWithAccount[]> {
  const profileId = await getAuthUserId()

  const rows = await db
    .select({
      id: savingsGoals.id,
      profileId: savingsGoals.profileId,
      accountId: savingsGoals.accountId,
      categoryId: savingsGoals.categoryId,
      name: savingsGoals.name,
      targetAmount: savingsGoals.targetAmount,
      currentAmount: savingsGoals.currentAmount,
      targetDate: savingsGoals.targetDate,
      iconUrl: savingsGoals.iconUrl,
      isActive: savingsGoals.isActive,
      createdAt: savingsGoals.createdAt,
      updatedAt: savingsGoals.updatedAt,
      account: {
        id: financialAccounts.id,
        name: financialAccounts.name,
        currency: financialAccounts.currency,
      },
      filterCategory: {
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
      },
    })
    .from(savingsGoals)
    .leftJoin(financialAccounts, eq(savingsGoals.accountId, financialAccounts.id))
    .leftJoin(categories, eq(savingsGoals.categoryId, categories.id))
    .where(and(eq(savingsGoals.profileId, profileId), eq(savingsGoals.isActive, true)))
    .orderBy(savingsGoals.createdAt)

  // Para metas con cuenta: calcular currentAmount desde transacciones de ingreso
  const results: SavingsGoalWithAccount[] = []

  for (const row of rows) {
    const isAutoTracked = !!row.accountId && !!row.account?.id
    let currentAmount: number

    if (isAutoTracked) {
      // Suma de ingresos en la cuenta desde la fecha de creación,
      // filtrando por categoría si está configurada
      const [sumRow] = await db
        .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.accountId, row.accountId!),
            eq(transactions.type, 'income'),
            eq(transactions.isTransfer, false),
            sql`${transactions.date} >= ${row.createdAt.toISOString().split('T')[0]}`,
            // Si hay categoría configurada, filtrar solo por ella; si no, contar todos los ingresos
            row.categoryId ? eq(transactions.categoryId, row.categoryId) : undefined,
          ),
        )

      currentAmount = parseFloat(sumRow?.total ?? '0')
    } else {
      currentAmount = parseFloat(row.currentAmount)
    }

    const target = parseFloat(row.targetAmount)
    const percentage = target > 0 ? Math.min((currentAmount / target) * 100, 100) : 0

    results.push({
      ...row,
      currentAmount: currentAmount.toFixed(2),
      account: row.account?.id ? row.account as Pick<FinancialAccount, 'id' | 'name' | 'currency'> : null,
      filterCategory: row.filterCategory?.id ? row.filterCategory as Pick<Category, 'id' | 'name' | 'icon' | 'color'> : null,
      percentage,
      remaining: Math.max(target - currentAmount, 0),
      isAutoTracked,
    })
  }

  return results
}

export async function createSavingsGoal(data: {
  name: string
  targetAmount: string
  currentAmount?: string
  targetDate?: string
  accountId?: string
  categoryId?: string
  iconUrl?: string
}) {
  const profileId = await getAuthUserId()

  await db.insert(savingsGoals).values({
    profileId,
    name: data.name,
    targetAmount: data.targetAmount,
    currentAmount: data.currentAmount ?? '0',
    targetDate: data.targetDate ?? null,
    accountId: data.accountId ?? null,
    categoryId: data.categoryId ?? null,
    iconUrl: data.iconUrl ?? null,
  })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

export async function updateSavingsGoal(
  id: string,
  data: {
    name: string
    targetAmount: string
    currentAmount: string
    targetDate?: string
    accountId?: string
    categoryId?: string
    iconUrl?: string
  },
) {
  const profileId = await getAuthUserId()

  await db
    .update(savingsGoals)
    .set({
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate ?? null,
      accountId: data.accountId ?? null,
      categoryId: data.categoryId ?? null,
      iconUrl: data.iconUrl ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.profileId, profileId)))

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

export async function addContribution(goalId: string, amount: string) {
  const profileId = await getAuthUserId()

  await db
    .update(savingsGoals)
    .set({
      currentAmount: sql`current_amount + ${amount}::numeric`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(savingsGoals.id, goalId),
        eq(savingsGoals.profileId, profileId),
        isNull(savingsGoals.accountId),
      ),
    )

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

export async function deleteSavingsGoal(id: string) {
  const profileId = await getAuthUserId()

  await db
    .update(savingsGoals)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.profileId, profileId)))

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}
