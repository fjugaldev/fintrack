import Link from 'next/link'
import { Target } from 'lucide-react'
import { getBudgets } from '@/lib/db/actions/budgets.actions'
import { getCategories } from '@/lib/db/actions/categories.actions'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { formatCurrency } from '@/lib/format'
import { getCategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CreateBudgetDialog } from './_components/create-budget-dialog'
import { EditBudgetDialog } from './_components/edit-budget-dialog'
import { DeleteBudgetButton } from './_components/delete-budget-button'
import type { BudgetWithSpent } from '@/lib/db/actions/budgets.actions'

type SearchParams = { period?: string }

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { period: periodParam } = await searchParams
  const period = periodParam === 'yearly' ? 'yearly' : 'monthly'

  const [budgetsList, categories, profile] = await Promise.all([
    getBudgets(period),
    getCategories(),
    getProfile(),
  ])

  const currency = profile?.currency ?? 'USD'

  const totalLimit = budgetsList.reduce((s, b) => s + parseFloat(b.limitAmount), 0)
  const totalSpent = budgetsList.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-sm text-muted-foreground">
            {budgetsList.length} presupuesto{budgetsList.length !== 1 ? 's' : ''} · {period === 'monthly' ? 'este mes' : 'este año'}
          </p>
        </div>
        <CreateBudgetDialog categories={categories} currency={currency} defaultPeriod={period} />
      </div>

      {/* Toggle mensual/anual */}
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <Link
          href="/budgets?period=monthly"
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            period === 'monthly'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Mensual
        </Link>
        <Link
          href="/budgets?period=yearly"
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            period === 'yearly'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Anual
        </Link>
      </div>

      {budgetsList.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Target /></EmptyMedia>
            <EmptyTitle>Sin presupuestos</EmptyTitle>
            <EmptyDescription>
              Crea un presupuesto para controlar cuánto gastas en cada categoría.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateBudgetDialog categories={categories} currency={currency} defaultPeriod={period} />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {/* Resumen global */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total gastado</span>
              <span className="tabular-nums">
                <span className={cn(
                  'font-semibold',
                  totalSpent > totalLimit ? 'text-red-500' : totalSpent / totalLimit >= 0.75 ? 'text-amber-500' : 'text-foreground',
                )}>
                  {formatCurrency(totalSpent, currency)}
                </span>
                <span className="text-muted-foreground"> / {formatCurrency(totalLimit, currency)}</span>
              </span>
            </div>
            <Progress
              value={totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0}
              className={cn(
                'h-2',
                totalSpent > totalLimit
                  ? '[&>div]:bg-red-500'
                  : totalSpent / totalLimit >= 0.75
                    ? '[&>div]:bg-amber-500'
                    : '[&>div]:bg-green-500',
              )}
            />
          </div>

          {/* Lista de presupuestos */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {budgetsList.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                currency={currency}
                categories={categories}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BudgetCard({
  budget,
  currency,
  categories,
}: {
  budget: BudgetWithSpent
  currency: string
  categories: Awaited<ReturnType<typeof getCategories>>
}) {
  const limit = parseFloat(budget.limitAmount)
  const pct = budget.percentage
  const isOver = pct >= 100
  const isWarning = pct >= 75 && pct < 100

  const Icon = getCategoryIcon(budget.category?.icon)

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"
            style={{ color: budget.category?.color ?? undefined }}
          >
            {Icon
              ? <Icon className="h-4 w-4" />
              : budget.category?.icon
                ? <span className="text-sm">{budget.category.icon}</span>
                : <Target className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {budget.category?.name ?? 'Global'}
            </p>
            <p className="text-xs text-muted-foreground">
              {budget.period === 'monthly' ? 'Mensual' : 'Anual'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <EditBudgetDialog budget={budget} categories={categories} currency={currency} />
          <DeleteBudgetButton budgetId={budget.id} />
        </div>
      </div>

      {/* Montos */}
      <div className="flex items-end justify-between text-sm">
        <span className={cn(
          'text-xl font-bold tabular-nums',
          isOver ? 'text-red-500 dark:text-red-400' : isWarning ? 'text-amber-500 dark:text-amber-400' : 'text-foreground',
        )}>
          {formatCurrency(budget.spent, currency)}
        </span>
        <span className="text-muted-foreground tabular-nums">
          de {formatCurrency(limit, currency)}
        </span>
      </div>

      {/* Barra de progreso */}
      <Progress
        value={Math.min(pct, 100)}
        className={cn(
          'h-2',
          isOver
            ? '[&>div]:bg-red-500'
            : isWarning
              ? '[&>div]:bg-amber-500'
              : '[&>div]:bg-green-500',
        )}
      />

      {/* Pie */}
      <p className={cn(
        'text-xs tabular-nums',
        isOver ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground',
      )}>
        {isOver
          ? `Excedido por ${formatCurrency(Math.abs(budget.remaining), currency)}`
          : `Disponible: ${formatCurrency(Math.max(budget.remaining, 0), currency)} (${Math.round(100 - pct)}%)`}
      </p>
    </div>
  )
}
