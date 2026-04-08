'use server'

import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transactions, financialAccounts, categories } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return user.id
}

function getMonthBounds(month: string): { firstDay: string; lastDay: string } {
  const [year, mon] = month.split('-').map(Number)
  const firstDay = `${month}-01`
  const lastDayDate = new Date(year, mon, 0)
  const lastDay = `${month}-${String(lastDayDate.getDate()).padStart(2, '0')}`
  return { firstDay, lastDay }
}

export type DashboardSummary = {
  totalBalance: number
  monthIncome: number
  monthExpense: number
  monthNet: number
  // true cuando hay al menos una cuenta en moneda extranjera (con o sin tasa configurada)
  isApproximate: boolean
  // true cuando hay cuentas en moneda extranjera SIN tasa de cambio configurada
  hasUnconfiguredForeignAccounts: boolean
  // monedas extranjeras sin tasa configurada
  unconfiguredCurrencies: string[]
}

export async function getDashboardSummary(month: string, baseCurrency: string): Promise<DashboardSummary> {
  const profileId = await getAuthUserId()
  const { firstDay, lastDay } = getMonthBounds(month)

  // Capital neto: todas las cuentas activas convertidas a moneda base
  const [balanceRow] = await db
    .select({
      totalBalance: sql<string>`COALESCE(SUM(${financialAccounts.balance}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0)), 0)`,
      isApproximate: sql<boolean>`BOOL_OR(${financialAccounts.currency} != ${baseCurrency})`,
      hasUnconfiguredForeignAccounts: sql<boolean>`BOOL_OR(${financialAccounts.currency} != ${baseCurrency} AND ${financialAccounts.exchangeRateToBase} IS NULL)`,
    })
    .from(financialAccounts)
    .where(and(eq(financialAccounts.profileId, profileId), eq(financialAccounts.isArchived, false)))

  const totalBalance = parseFloat(balanceRow?.totalBalance ?? '0')
  const isApproximate = balanceRow?.isApproximate ?? false
  const hasUnconfiguredForeignAccounts = balanceRow?.hasUnconfiguredForeignAccounts ?? false

  // Obtener las monedas extranjeras sin tasa configurada (para el aviso en UI)
  let unconfiguredCurrencies: string[] = []
  if (hasUnconfiguredForeignAccounts) {
    const unconfiguredRows = await db
      .selectDistinct({ currency: financialAccounts.currency })
      .from(financialAccounts)
      .where(
        and(
          eq(financialAccounts.profileId, profileId),
          eq(financialAccounts.isArchived, false),
          sql`${financialAccounts.currency} != ${baseCurrency}`,
          sql`${financialAccounts.exchangeRateToBase} IS NULL`,
        ),
      )
    unconfiguredCurrencies = unconfiguredRows.map((r) => r.currency)
  }

  // Ingresos/gastos del mes: join con account para obtener tasa de conversión
  const [monthRows] = await db
    .select({
      monthIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' AND NOT ${transactions.isTransfer} THEN ${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0) ELSE 0 END), 0)`,
      monthExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' AND NOT ${transactions.isTransfer} THEN ${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0) ELSE 0 END), 0)`,
    })
    .from(transactions)
    .innerJoin(financialAccounts, eq(transactions.accountId, financialAccounts.id))
    .where(
      and(
        eq(transactions.profileId, profileId),
        gte(transactions.date, firstDay),
        lte(transactions.date, lastDay),
      ),
    )

  const monthIncome = parseFloat(monthRows?.monthIncome ?? '0')
  const monthExpense = parseFloat(monthRows?.monthExpense ?? '0')

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    monthNet: monthIncome - monthExpense,
    isApproximate,
    hasUnconfiguredForeignAccounts,
    unconfiguredCurrencies,
  }
}

export type CategoryExpense = {
  categoryId: string
  categoryName: string
  categoryColor: string
  total: number
}

export async function getExpensesByCategory(month: string): Promise<CategoryExpense[]> {
  const profileId = await getAuthUserId()
  const { firstDay, lastDay } = getMonthBounds(month)

  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      total: sql<string>`SUM(${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0))`,
    })
    .from(transactions)
    .innerJoin(financialAccounts, eq(transactions.accountId, financialAccounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.type, 'expense'),
        eq(transactions.isTransfer, false),
        gte(transactions.date, firstDay),
        lte(transactions.date, lastDay),
      ),
    )
    .groupBy(categories.id, categories.name, categories.color)
    .orderBy(sql`SUM(${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0)) DESC`)

  const parsed = rows.map((r) => ({
    categoryId: r.categoryId ?? 'uncategorized',
    categoryName: r.categoryName ?? 'Sin categoría',
    categoryColor: r.categoryColor ?? '#9ca3af',
    total: parseFloat(r.total),
  }))

  if (parsed.length <= 6) return parsed

  const top6 = parsed.slice(0, 6)
  const othersTotal = parsed.slice(6).reduce((s, r) => s + r.total, 0)
  return [
    ...top6,
    { categoryId: 'others', categoryName: 'Otros', categoryColor: '#9ca3af', total: othersTotal },
  ]
}

export type MonthlyTrend = {
  month: string
  income: number
  expense: number
}

export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  const profileId = await getAuthUserId()

  // Últimos 6 meses incluyendo el actual
  const monthsArray: string[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const sixMonthsAgo = `${monthsArray[0]}-01`

  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
      income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' AND NOT ${transactions.isTransfer} THEN ${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0) ELSE 0 END), 0)`,
      expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' AND NOT ${transactions.isTransfer} THEN ${transactions.amount}::numeric * COALESCE(${financialAccounts.exchangeRateToBase}::numeric, 1.0) ELSE 0 END), 0)`,
    })
    .from(transactions)
    .innerJoin(financialAccounts, eq(transactions.accountId, financialAccounts.id))
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.isTransfer, false),
        gte(transactions.date, sixMonthsAgo),
      ),
    )
    .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM') ASC`)

  const byMonth = Object.fromEntries(rows.map((r) => [r.month, r]))

  return monthsArray.map((m) => ({
    month: m,
    income: parseFloat(byMonth[m]?.income ?? '0'),
    expense: parseFloat(byMonth[m]?.expense ?? '0'),
  }))
}
