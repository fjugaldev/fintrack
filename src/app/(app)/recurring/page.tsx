import { RefreshCcw, TrendingDown, TrendingUp } from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
import { getRecurringTransactions } from '@/lib/db/actions/recurring.actions'
import { getAccounts } from '@/lib/db/actions/accounts.actions'
import { getCategories } from '@/lib/db/actions/categories.actions'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { formatCurrency, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CreateRecurringDialog } from './_components/create-recurring-dialog'
import { EditRecurringDialog } from './_components/edit-recurring-dialog'
import { DeleteRecurringButton } from './_components/delete-recurring-button'
import { ApplyRecurringButton } from './_components/apply-recurring-button'
import { ToggleActiveButton } from './_components/toggle-active-button'

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
}

export default async function RecurringPage() {
  const today = new Date().toISOString().split('T')[0]

  const [recurrents, accounts, categories, profile] = await Promise.all([
    getRecurringTransactions(),
    getAccounts(),
    getCategories(),
    getProfile(),
  ])

  const currency = profile?.currency ?? 'USD'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurrentes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus ingresos y gastos periódicos
          </p>
        </div>
        <CreateRecurringDialog accounts={accounts} categories={categories} />
      </div>

      {/* Lista */}
      {recurrents.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <RefreshCcw className="h-10 w-10 text-muted-foreground/50" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Sin transacciones recurrentes</EmptyTitle>
            <EmptyDescription>
              Agrega tu primera transacción recurrente para automatizar tus finanzas.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateRecurringDialog accounts={accounts} categories={categories} />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden">
          {recurrents.map((rec) => {
            const isDue = rec.nextDueDate <= today
            const appliedToday = rec.lastAppliedDate === today
            const CategoryIcon = getCategoryIcon(rec.category?.icon ?? null)

            return (
              <div
                key={rec.id}
                className={`flex gap-3 px-4 py-3 bg-background transition-colors ${
                  !rec.isActive ? 'opacity-50' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className="flex h-9 w-9 shrink-0 mt-0.5 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${rec.category?.color ?? '#6b7280'}20` }}
                >
                  {CategoryIcon ? (
                    <CategoryIcon
                      className="h-4 w-4"
                      style={{ color: rec.category?.color ?? '#6b7280' }}
                    />
                  ) : rec.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">
                      {rec.description ?? rec.category?.name ?? 'Sin descripción'}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {FREQ_LABELS[rec.frequency] ?? rec.frequency}
                    </Badge>
                    {appliedToday && (
                      <Badge variant="outline" className="text-xs shrink-0 border-green-500 text-green-600 dark:text-green-400">
                        Aplicada hoy
                      </Badge>
                    )}
                    {isDue && !appliedToday && rec.isActive && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Vencida
                      </Badge>
                    )}
                  </div>

                  {/* Account + next date */}
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <span className="truncate">{rec.account.name}</span>
                    <span className="shrink-0">·</span>
                    <span className="whitespace-nowrap shrink-0">Próx. {formatDate(rec.nextDueDate)}</span>
                  </div>

                  {/* Amount + actions */}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`font-semibold tabular-nums text-sm ${
                        rec.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {rec.type === 'income' ? '+' : '-'}
                      {formatCurrency(rec.amount, rec.account.currency ?? currency)}
                    </span>

                    <div className="flex items-center gap-0.5">
                      {rec.isActive && !appliedToday && (
                        <ApplyRecurringButton
                          id={rec.id}
                          description={rec.description}
                          isDue={isDue}
                        />
                      )}
                      <ToggleActiveButton id={rec.id} isActive={rec.isActive} />
                      <EditRecurringDialog
                        recurring={rec}
                        accounts={accounts}
                        categories={categories}
                      />
                      <DeleteRecurringButton id={rec.id} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
