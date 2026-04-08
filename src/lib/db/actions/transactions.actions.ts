'use server'

import { and, asc, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { transactions, financialAccounts, categories } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import type { Transaction, FinancialAccount, Category } from '@/lib/db/schema'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

export type TransactionFilters = {
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
  type?: 'income' | 'expense' | 'all'
  accountId?: string
  categoryId?: string
}

export type TransactionWithRelations = Transaction & {
  account: Pick<FinancialAccount, 'id' | 'name' | 'color' | 'currency'>
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
}

export async function getTransactions(filters: TransactionFilters = {}): Promise<{
  data: TransactionWithRelations[]
  total: number
  pages: number
}> {
  const profileId = await getAuthUserId()
  const limit = filters.limit ?? 15
  const page = filters.page ?? 1
  const offset = (page - 1) * limit

  const conditions = [eq(transactions.profileId, profileId)]

  if (filters.dateFrom) conditions.push(gte(transactions.date, filters.dateFrom))
  if (filters.dateTo) conditions.push(lte(transactions.date, filters.dateTo))
  if (filters.type && filters.type !== 'all') conditions.push(eq(transactions.type, filters.type))
  if (filters.accountId) conditions.push(eq(transactions.accountId, filters.accountId))
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId))

  const where = and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select({
        id: transactions.id,
        profileId: transactions.profileId,
        accountId: transactions.accountId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        notes: transactions.notes,
        date: transactions.date,
        receiptUrl: transactions.receiptUrl,
        merchant: transactions.merchant,
        isTransfer: transactions.isTransfer,
        transferToAccountId: transactions.transferToAccountId,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
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
      .from(transactions)
      .innerJoin(financialAccounts, eq(transactions.accountId, financialAccounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(transactions)
      .where(where),
  ])

  return {
    data: rows as TransactionWithRelations[],
    total: Number(total),
    pages: Math.ceil(Number(total) / limit),
  }
}

export async function createTransaction(data: {
  accountId: string
  toAccountId?: string
  categoryId?: string
  amount: string
  toAmount?: string
  exchangeRate?: string
  type: 'income' | 'expense' | 'transfer'
  description?: string
  notes?: string
  date: string
  merchant?: string
}) {
  const profileId = await getAuthUserId()

  const result = await db.transaction(async (tx) => {
    if (data.type === 'transfer' && data.toAccountId) {
      // toAmount: monto en moneda destino (solo cross-currency). Si misma moneda, igual a amount.
      const destAmount = data.toAmount ?? data.amount

      await tx.insert(transactions).values([
        {
          profileId,
          accountId: data.accountId,
          amount: data.amount,
          type: 'expense' as const,
          description: data.description ?? 'Transferencia',
          notes: data.notes ?? null,
          date: data.date,
          isTransfer: true,
          transferToAccountId: data.toAccountId,
          toAmount: data.toAmount ?? null,
          exchangeRate: data.exchangeRate ?? null,
        },
        {
          profileId,
          accountId: data.toAccountId,
          amount: destAmount,
          type: 'income' as const,
          description: data.description ?? 'Transferencia',
          notes: data.notes ?? null,
          date: data.date,
          isTransfer: true,
          transferToAccountId: data.accountId,
          toAmount: data.toAmount ? data.amount : null,
          exchangeRate: data.exchangeRate ?? null,
        },
      ])

      await tx
        .update(financialAccounts)
        .set({ balance: sql`balance - ${data.amount}::numeric`, updatedAt: new Date() })
        .where(and(eq(financialAccounts.id, data.accountId), eq(financialAccounts.profileId, profileId)))

      await tx
        .update(financialAccounts)
        .set({ balance: sql`balance + ${destAmount}::numeric`, updatedAt: new Date() })
        .where(and(eq(financialAccounts.id, data.toAccountId), eq(financialAccounts.profileId, profileId)))

      return null
    }

    const [txn] = await tx
      .insert(transactions)
      .values({
        profileId,
        accountId: data.accountId,
        categoryId: data.categoryId ?? null,
        amount: data.amount,
        type: data.type as 'income' | 'expense',
        description: data.description ?? null,
        notes: data.notes ?? null,
        date: data.date,
        merchant: data.merchant ?? null,
      })
      .returning()

    const balanceDelta =
      data.type === 'income'
        ? sql`balance + ${data.amount}::numeric`
        : sql`balance - ${data.amount}::numeric`

    await tx
      .update(financialAccounts)
      .set({ balance: balanceDelta, updatedAt: new Date() })
      .where(
        and(
          eq(financialAccounts.id, data.accountId),
          eq(financialAccounts.profileId, profileId),
        ),
      )

    return txn
  })

  revalidatePath('/transactions')
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return result
}

export async function updateTransaction(
  id: string,
  data: {
    accountId: string
    categoryId?: string
    amount: string
    type: 'income' | 'expense'
    description?: string
    notes?: string
    date: string
    merchant?: string
  },
) {
  const profileId = await getAuthUserId()

  const result = await db.transaction(async (tx) => {
    // Buscar la transacción original para revertir su delta
    const [original] = await tx
      .select({ amount: transactions.amount, type: transactions.type, accountId: transactions.accountId })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.profileId, profileId)))

    if (!original) throw new Error('Transacción no encontrada')

    // Revertir el balance original
    const revertDelta =
      original.type === 'income'
        ? sql`balance - ${original.amount}::numeric`
        : sql`balance + ${original.amount}::numeric`

    await tx
      .update(financialAccounts)
      .set({ balance: revertDelta, updatedAt: new Date() })
      .where(
        and(
          eq(financialAccounts.id, original.accountId),
          eq(financialAccounts.profileId, profileId),
        ),
      )

    // Aplicar el nuevo delta
    const newDelta =
      data.type === 'income'
        ? sql`balance + ${data.amount}::numeric`
        : sql`balance - ${data.amount}::numeric`

    await tx
      .update(financialAccounts)
      .set({ balance: newDelta, updatedAt: new Date() })
      .where(
        and(
          eq(financialAccounts.id, data.accountId),
          eq(financialAccounts.profileId, profileId),
        ),
      )

    const [updated] = await tx
      .update(transactions)
      .set({
        accountId: data.accountId,
        categoryId: data.categoryId ?? null,
        amount: data.amount,
        type: data.type,
        description: data.description ?? null,
        notes: data.notes ?? null,
        date: data.date,
        merchant: data.merchant ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.profileId, profileId)))
      .returning()

    return updated
  })

  revalidatePath('/transactions')
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return result
}

export async function deleteTransaction(id: string) {
  const profileId = await getAuthUserId()

  await db.transaction(async (tx) => {
    const [original] = await tx
      .select({ amount: transactions.amount, type: transactions.type, accountId: transactions.accountId })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.profileId, profileId)))

    if (!original) throw new Error('Transacción no encontrada')

    // Revertir el balance
    const revertDelta =
      original.type === 'income'
        ? sql`balance - ${original.amount}::numeric`
        : sql`balance + ${original.amount}::numeric`

    await tx
      .update(financialAccounts)
      .set({ balance: revertDelta, updatedAt: new Date() })
      .where(
        and(
          eq(financialAccounts.id, original.accountId),
          eq(financialAccounts.profileId, profileId),
        ),
      )

    await tx
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.profileId, profileId)))
  })

  revalidatePath('/transactions')
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}
