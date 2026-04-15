'use server'

import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { budgets, transactions, financialAccounts, categories } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import type { Budget, Category } from '@/lib/db/schema'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

function getPeriodBounds(period: 'monthly' | 'yearly', referenceDate: Date = new Date()): {
  firstDay: string
  lastDay: string
} {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()

  if (period === 'monthly') {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    return {
      firstDay: first.toISOString().split('T')[0],
      lastDay: last.toISOString().split('T')[0],
    }
  } else {
    return {
      firstDay: `${year}-01-01`,
      lastDay: `${year}-12-31`,
    }
  }
}

export type BudgetWithSpent = Budget & {
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
  spent: number
  percentage: number
  remaining: number
}

export async function getBudgets(period: 'monthly' | 'yearly' = 'monthly'): Promise<BudgetWithSpent[]> {
  const profileId = await getAuthUserId()
  const { firstDay, lastDay } = getPeriodBounds(period)

  // Traer todos los presupuestos del período
  const rows = await db
    .select({
      id: budgets.id,
      profileId: budgets.profileId,
      categoryId: budgets.categoryId,
      limitAmount: budgets.limitAmount,
      period: budgets.period,
      startDate: budgets.startDate,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
      },
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(and(eq(budgets.profileId, profileId), eq(budgets.period, period)))
    .orderBy(budgets.createdAt)

  if (rows.length === 0) return []

  // Calcular el gasto real por categoría en el período actual
  const spentRows = await db
    .select({
      categoryId: transactions.categoryId,
      spent: sql<string>`COALESCE(SUM(${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0)), 0)`,
    })
    .from(transactions)
    .innerJoin(financialAccounts, eq(transactions.accountId, financialAccounts.id))
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.type, 'expense'),
        eq(transactions.isTransfer, false),
        gte(transactions.date, firstDay),
        lte(transactions.date, lastDay),
      ),
    )
    .groupBy(transactions.categoryId)

  const spentMap = Object.fromEntries(spentRows.map((r) => [r.categoryId ?? 'null', parseFloat(r.spent)]))

  // Buscar categorías hijas de las categorías con presupuesto (para suma jerárquica)
  const budgetCategoryIds = rows.map((r) => r.categoryId).filter(Boolean) as string[]
  const childRows = budgetCategoryIds.length > 0
    ? await db
        .select({ id: categories.id, parentId: categories.parentId })
        .from(categories)
        .where(inArray(categories.parentId, budgetCategoryIds))
    : []

  const childrenByParent: Record<string, string[]> = {}
  for (const child of childRows) {
    if (!child.parentId) continue
    childrenByParent[child.parentId] ??= []
    childrenByParent[child.parentId].push(child.id)
  }

  return rows.map((row) => {
    const limit = parseFloat(row.limitAmount)
    // Presupuesto con categoría: suma la categoría padre + todas sus hijas
    // Presupuesto global (sin categoría): suma todos los gastos del período
    const spent = row.categoryId
      ? (spentMap[row.categoryId] ?? 0) +
        (childrenByParent[row.categoryId] ?? [])
          .reduce((sum, childId) => sum + (spentMap[childId] ?? 0), 0)
      : Object.values(spentMap).reduce((a, b) => a + b, 0)
    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 999) : 0
    return {
      ...row,
      category: row.category?.id ? row.category as Pick<Category, 'id' | 'name' | 'icon' | 'color'> : null,
      spent,
      percentage,
      remaining: limit - spent,
    }
  })
}

export async function createBudget(data: {
  categoryId?: string
  limitAmount: string
  period: 'monthly' | 'yearly'
}) {
  const profileId = await getAuthUserId()
  const startDate = new Date().toISOString().split('T')[0]

  await db.insert(budgets).values({
    profileId,
    categoryId: data.categoryId || null,
    limitAmount: data.limitAmount,
    period: data.period,
    startDate,
  })

  revalidatePath('/budgets')
  revalidatePath('/')
}

export async function updateBudget(
  id: string,
  data: { categoryId?: string; limitAmount: string; period: 'monthly' | 'yearly' },
) {
  const profileId = await getAuthUserId()

  await db
    .update(budgets)
    .set({
      categoryId: data.categoryId || null,
      limitAmount: data.limitAmount,
      period: data.period,
      updatedAt: new Date(),
    })
    .where(and(eq(budgets.id, id), eq(budgets.profileId, profileId)))

  revalidatePath('/budgets')
  revalidatePath('/')
}

export async function deleteBudget(id: string) {
  const profileId = await getAuthUserId()
  await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.profileId, profileId)))
  revalidatePath('/budgets')
  revalidatePath('/')
}
