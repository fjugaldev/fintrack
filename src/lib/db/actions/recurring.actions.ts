'use server'

import { and, asc, eq, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { recurringTransactions, transactions, financialAccounts, categories } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import type { RecurringTransaction, FinancialAccount, Category } from '@/lib/db/schema'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

export type RecurringWithRelations = RecurringTransaction & {
  account: Pick<FinancialAccount, 'id' | 'name' | 'color' | 'currency'>
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
}

export async function getRecurringTransactions(): Promise<RecurringWithRelations[]> {
  const profileId = await getAuthUserId()

  const rows = await db
    .select({
      id: recurringTransactions.id,
      profileId: recurringTransactions.profileId,
      accountId: recurringTransactions.accountId,
      categoryId: recurringTransactions.categoryId,
      amount: recurringTransactions.amount,
      type: recurringTransactions.type,
      description: recurringTransactions.description,
      frequency: recurringTransactions.frequency,
      nextDueDate: recurringTransactions.nextDueDate,
      isActive: recurringTransactions.isActive,
      lastAppliedDate: recurringTransactions.lastAppliedDate,
      createdAt: recurringTransactions.createdAt,
      updatedAt: recurringTransactions.updatedAt,
      account: {
        id: financialAccounts.id,
        name: financialAccounts.name,
        color: financialAccounts.color,
        currency: financialAccounts.currency,
      },
      category: {
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
      },
    })
    .from(recurringTransactions)
    .innerJoin(financialAccounts, eq(recurringTransactions.accountId, financialAccounts.id))
    .leftJoin(categories, eq(recurringTransactions.categoryId, categories.id))
    .where(eq(recurringTransactions.profileId, profileId))
    .orderBy(asc(recurringTransactions.nextDueDate))

  return rows.map((row) => ({
    ...row,
    category: row.category?.id ? row.category : null,
  }))
}

export type RecurringFormData = {
  accountId: string
  categoryId?: string | null
  amount: string
  type: 'income' | 'expense'
  description?: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDueDate: string
}

export async function createRecurringTransaction(data: RecurringFormData) {
  const profileId = await getAuthUserId()

  await db.insert(recurringTransactions).values({
    profileId,
    accountId: data.accountId,
    categoryId: data.categoryId ?? null,
    amount: data.amount,
    type: data.type,
    description: data.description ?? null,
    frequency: data.frequency,
    nextDueDate: data.nextDueDate,
    isActive: true,
  })

  revalidatePath('/recurring')
}

export async function updateRecurringTransaction(id: string, data: RecurringFormData) {
  const profileId = await getAuthUserId()

  await db
    .update(recurringTransactions)
    .set({
      accountId: data.accountId,
      categoryId: data.categoryId ?? null,
      amount: data.amount,
      type: data.type,
      description: data.description ?? null,
      frequency: data.frequency,
      nextDueDate: data.nextDueDate,
      updatedAt: new Date(),
    })
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.profileId, profileId)))

  revalidatePath('/recurring')
}

export async function deleteRecurringTransaction(id: string) {
  const profileId = await getAuthUserId()

  await db
    .delete(recurringTransactions)
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.profileId, profileId)))

  revalidatePath('/recurring')
}

export async function toggleRecurringActive(id: string, isActive: boolean) {
  const profileId = await getAuthUserId()

  await db
    .update(recurringTransactions)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.profileId, profileId)))

  revalidatePath('/recurring')
}

function calcNextDueDate(current: string, frequency: RecurringTransaction['frequency']): string {
  const date = new Date(current + 'T12:00:00Z')
  switch (frequency) {
    case 'daily':   date.setUTCDate(date.getUTCDate() + 1); break
    case 'weekly':  date.setUTCDate(date.getUTCDate() + 7); break
    case 'monthly': date.setUTCMonth(date.getUTCMonth() + 1); break
    case 'yearly':  date.setUTCFullYear(date.getUTCFullYear() + 1); break
  }
  return date.toISOString().split('T')[0]
}

export async function applyRecurringTransaction(id: string) {
  const profileId = await getAuthUserId()

  const [recurring] = await db
    .select()
    .from(recurringTransactions)
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.profileId, profileId)))

  if (!recurring) throw new Error('Transacción recurrente no encontrada')
  if (!recurring.isActive) throw new Error('La transacción recurrente está inactiva')

  const today = new Date().toISOString().split('T')[0]
  if (recurring.lastAppliedDate === today) {
    throw new Error('Esta transacción ya fue aplicada hoy')
  }

  await db.transaction(async (tx) => {
    // Create the actual transaction
    await tx.insert(transactions).values({
      profileId,
      accountId: recurring.accountId,
      categoryId: recurring.categoryId,
      amount: recurring.amount,
      type: recurring.type,
      description: recurring.description,
      date: recurring.nextDueDate,
    })

    // Update account balance
    const balanceDelta =
      recurring.type === 'income'
        ? sql`balance + ${recurring.amount}::numeric`
        : sql`balance - ${recurring.amount}::numeric`

    await tx
      .update(financialAccounts)
      .set({ balance: balanceDelta, updatedAt: new Date() })
      .where(and(eq(financialAccounts.id, recurring.accountId), eq(financialAccounts.profileId, profileId)))

    // Advance nextDueDate and mark lastAppliedDate
    const next = calcNextDueDate(recurring.nextDueDate, recurring.frequency)
    await tx
      .update(recurringTransactions)
      .set({ nextDueDate: next, lastAppliedDate: today, updatedAt: new Date() })
      .where(eq(recurringTransactions.id, id))
  })

  revalidatePath('/recurring')
  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function getDueRecurringTransactions(): Promise<RecurringWithRelations[]> {
  const profileId = await getAuthUserId()
  const today = new Date().toISOString().split('T')[0]

  const rows = await db
    .select({
      id: recurringTransactions.id,
      profileId: recurringTransactions.profileId,
      accountId: recurringTransactions.accountId,
      categoryId: recurringTransactions.categoryId,
      amount: recurringTransactions.amount,
      type: recurringTransactions.type,
      description: recurringTransactions.description,
      frequency: recurringTransactions.frequency,
      nextDueDate: recurringTransactions.nextDueDate,
      isActive: recurringTransactions.isActive,
      lastAppliedDate: recurringTransactions.lastAppliedDate,
      createdAt: recurringTransactions.createdAt,
      updatedAt: recurringTransactions.updatedAt,
      account: {
        id: financialAccounts.id,
        name: financialAccounts.name,
        color: financialAccounts.color,
        currency: financialAccounts.currency,
      },
      category: {
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
      },
    })
    .from(recurringTransactions)
    .innerJoin(financialAccounts, eq(recurringTransactions.accountId, financialAccounts.id))
    .leftJoin(categories, eq(recurringTransactions.categoryId, categories.id))
    .where(
      and(
        eq(recurringTransactions.profileId, profileId),
        eq(recurringTransactions.isActive, true),
        lte(recurringTransactions.nextDueDate, today),
      ),
    )
    .orderBy(asc(recurringTransactions.nextDueDate))

  return rows.map((row) => ({
    ...row,
    category: row.category?.id ? row.category : null,
  }))
}
