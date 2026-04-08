import { Target, CalendarClock, Zap } from 'lucide-react'
import { getSavingsGoals } from '@/lib/db/actions/savings-goals.actions'
import { getAccounts } from '@/lib/db/actions/accounts.actions'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { getCategories } from '@/lib/db/actions/categories.actions'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getCategoryIcon } from '@/lib/category-icons'
import { Progress } from '@/components/ui/progress'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CreateGoalDialog } from './_components/create-goal-dialog'
import { EditGoalDialog } from './_components/edit-goal-dialog'
import { DeleteGoalButton } from './_components/delete-goal-button'
import { AddContributionDialog } from './_components/add-contribution-dialog'
import type { SavingsGoalWithAccount } from '@/lib/db/actions/savings-goals.actions'
import type { FinancialAccount, Category } from '@/lib/db/schema'

export default async function GoalsPage() {
  const [goals, accounts, profile, allCategories] = await Promise.all([
    getSavingsGoals(),
    getAccounts(),
    getProfile(),
    getCategories(),
  ])

  const currency = profile?.currency ?? 'USD'
  const incomeCategories = allCategories.filter((c) => c.type === 'income' && !c.isSystem)
  const completed = goals.filter((g) => g.percentage >= 100)
  const inProgress = goals.filter((g) => g.percentage < 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Metas de ahorro</h1>
          <p className="text-sm text-muted-foreground">
            {goals.length} meta{goals.length !== 1 ? 's' : ''} activa{goals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateGoalDialog accounts={accounts} incomeCategories={incomeCategories} currency={currency} />
      </div>

      {goals.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Target /></EmptyMedia>
            <EmptyTitle>Sin metas de ahorro</EmptyTitle>
            <EmptyDescription>
              Define una meta para hacer seguimiento de tu progreso de ahorro.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateGoalDialog accounts={accounts} incomeCategories={incomeCategories} currency={currency} />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-6">
          {/* En progreso */}
          {inProgress.length > 0 && (
            <section className="space-y-3">
              {completed.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  En progreso
                </h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} accounts={accounts} incomeCategories={incomeCategories} currency={currency} />
                ))}
              </div>
            </section>
          )}

          {/* Completadas */}
          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Completadas 🎉
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} accounts={accounts} incomeCategories={incomeCategories} currency={currency} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function GoalCard({
  goal,
  accounts,
  incomeCategories,
  currency,
}: {
  goal: SavingsGoalWithAccount
  accounts: FinancialAccount[]
  incomeCategories: Pick<Category, 'id' | 'name' | 'icon' | 'color'>[]
  currency: string
}) {
  const isCompleted = goal.percentage >= 100
  const displayCurrency = goal.account?.currency ?? currency

  // Días restantes
  let daysLeft: number | null = null
  let isOverdue = false
  if (goal.targetDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(goal.targetDate + 'T00:00:00')
    daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    isOverdue = daysLeft < 0 && !isCompleted
  }

  const FilterCategoryIcon = goal.filterCategory
    ? getCategoryIcon(goal.filterCategory.icon)
    : null

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-4',
      isCompleted && 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20',
    )}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            isCompleted ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground',
          )}>
            <Target className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{goal.name}</p>
            {goal.account ? (
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs text-muted-foreground truncate">{goal.account.name}</span>
                {/* Badge seguimiento automático */}
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 text-[10px] font-medium">
                  <Zap className="h-2.5 w-2.5" />
                  Auto
                </span>
                {/* Badge categoría filtro */}
                {goal.filterCategory && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: goal.filterCategory.color ? `${goal.filterCategory.color}20` : undefined,
                      color: goal.filterCategory.color ?? undefined,
                    }}
                  >
                    {FilterCategoryIcon && <FilterCategoryIcon className="h-2.5 w-2.5" />}
                    {goal.filterCategory.name}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <EditGoalDialog goal={goal} accounts={accounts} incomeCategories={incomeCategories} currency={currency} />
          <DeleteGoalButton goalId={goal.id} />
        </div>
      </div>

      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex items-end justify-between text-sm">
          <span className={cn(
            'text-xl font-bold tabular-nums',
            isCompleted ? 'text-green-600 dark:text-green-400' : 'text-foreground',
          )}>
            {formatCurrency(goal.currentAmount, displayCurrency)}
          </span>
          <span className="text-muted-foreground tabular-nums text-xs">
            de {formatCurrency(goal.targetAmount, displayCurrency)}
          </span>
        </div>
        <Progress
          value={goal.percentage}
          className={cn(
            'h-2.5',
            isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-primary',
          )}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={cn(isCompleted && 'text-green-600 dark:text-green-400 font-medium')}>
            {isCompleted ? '¡Meta alcanzada!' : `${Math.round(goal.percentage)}% completado`}
          </span>
          {!isCompleted && (
            <span>Faltan {formatCurrency(goal.remaining, displayCurrency)}</span>
          )}
        </div>
      </div>

      {/* Fila inferior: fecha (izq) + botón aporte (der) */}
      {(goal.targetDate || (!goal.isAutoTracked && !isCompleted)) && (
        <div className="flex items-center justify-between gap-2">
          {goal.targetDate ? (
            <div className={cn(
              'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5',
              isOverdue
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                : isCompleted
                  ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                  : 'bg-muted text-muted-foreground',
            )}>
              <CalendarClock className="h-3 w-3" />
              {isOverdue
                ? `Venció hace ${Math.abs(daysLeft!)} días`
                : daysLeft === 0
                  ? 'Vence hoy'
                  : daysLeft === 1
                    ? 'Vence mañana'
                    : daysLeft !== null && daysLeft <= 30
                      ? `${daysLeft} días restantes`
                      : formatDate(goal.targetDate)}
            </div>
          ) : (
            <span />
          )}
          {!goal.isAutoTracked && !isCompleted && (
            <AddContributionDialog
              goalId={goal.id}
              goalName={goal.name}
              currency={displayCurrency}
            />
          )}
        </div>
      )}
    </div>
  )
}
