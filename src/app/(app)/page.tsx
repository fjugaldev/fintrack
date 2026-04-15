import { TrendingUp, TrendingDown, Wallet, BarChart3, AlertTriangle } from 'lucide-react'
import { getDashboardSummary, getExpensesByCategory, getMonthlyTrends } from '@/lib/db/actions/dashboard.actions'
import { getTransactions } from '@/lib/db/actions/transactions.actions'
import { getAccounts } from '@/lib/db/actions/accounts.actions'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PeriodSelector } from './_components/period-selector'
import { StatCard } from './_components/stat-card'
import { AccountsSummary } from './_components/accounts-summary'
import { RecentTransactions } from './_components/recent-transactions'
import { ExpensesDonut } from './_components/expenses-donut'
import { IncomeExpenseBar } from './_components/income-expense-bar'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const currentMonth = month ?? getCurrentMonth()

  const profile = await getProfile()
  const currency = profile?.currency ?? 'USD'

  const [summary, expensesByCategory, trends, { data: recentTxns }, accounts] =
    await Promise.all([
      getDashboardSummary(currentMonth, currency),
      getExpensesByCategory(currentMonth),
      getMonthlyTrends(),
      getTransactions({ limit: 5 }),
      getAccounts(),
    ])

  const approxPrefix = summary.isApproximate ? '≈ ' : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Hola, {profile?.fullName ?? 'usuario'}
          </p>
        </div>
        <PeriodSelector currentMonth={currentMonth} />
      </div>

      {/* Aviso: cuentas extranjeras sin tasa de cambio */}
      {summary.hasUnconfiguredForeignAccounts && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Las cuentas en {summary.unconfiguredCurrencies.join(', ')} no tienen tasa de cambio configurada —
            el Capital Neto las suma como 1:1.{' '}
            <a href="/accounts" className="font-semibold underline underline-offset-2">
              Configura la tasa en Cuentas
            </a>{' '}
            para ver los totales correctos.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Capital neto"
          value={`${approxPrefix}${formatCurrency(summary.totalBalance, currency)}`}
          sublabel={summary.isApproximate ? `Convertido a ${currency}` : 'Todas las cuentas'}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Ingresos"
          value={`${approxPrefix}${formatCurrency(summary.monthIncome, currency)}`}
          sublabel={summary.isApproximate ? `Este mes · convertido a ${currency}` : 'Este mes'}
          valueClassName="text-green-600 dark:text-green-400"
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          label="Gastos"
          value={`${approxPrefix}${formatCurrency(summary.monthExpense, currency)}`}
          sublabel={summary.isApproximate ? `Este mes · convertido a ${currency}` : 'Este mes'}
          valueClassName="text-red-500 dark:text-red-400"
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
        />
        <StatCard
          label="Balance neto"
          value={`${approxPrefix}${formatCurrency(summary.monthNet, currency)}`}
          sublabel="Ingresos − Gastos"
          valueClassName={cn(
            summary.monthNet > 0 && 'text-green-600 dark:text-green-400',
            summary.monthNet < 0 && 'text-red-500 dark:text-red-400',
          )}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ExpensesDonut data={expensesByCategory} currency={currency} />
        <IncomeExpenseBar data={trends} currency={currency} />
      </div>

      {/* Cuentas + Recientes */}
      <div className="grid lg:grid-cols-2 gap-4">
        <AccountsSummary accounts={accounts} currency={currency} />
        <RecentTransactions transactions={recentTxns} currency={currency} />
      </div>
    </div>
  )
}
