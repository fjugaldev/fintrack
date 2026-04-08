import { ReceiptText } from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
import { getTransactions } from '@/lib/db/actions/transactions.actions'
import { getAccounts } from '@/lib/db/actions/accounts.actions'
import { getCategories } from '@/lib/db/actions/categories.actions'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { formatCurrency, formatDate } from '@/lib/format'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CreateTransactionDialog } from './_components/create-transaction-dialog'
import { EditTransactionDialog } from './_components/edit-transaction-dialog'
import { DeleteTransactionButton } from './_components/delete-transaction-button'
import { TransactionFilters } from './_components/transaction-filters'
import { TransactionsPagination } from './_components/transactions-pagination'

type SearchParams = {
  page?: string
  type?: string
  accountId?: string
  dateFrom?: string
  dateTo?: string
}

function getDefaultDateRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${lastDay}`,
  }
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const defaults = getDefaultDateRange()

  const filters = {
    page: Number(params.page ?? 1),
    dateFrom: params.dateFrom ?? defaults.dateFrom,
    dateTo: params.dateTo ?? defaults.dateTo,
    type: (params.type as 'income' | 'expense' | 'all') ?? 'all',
    accountId: params.accountId,
  }

  const [{ data: txns, total, pages }, accounts, categories, profile] = await Promise.all([
    getTransactions(filters),
    getAccounts(),
    getCategories(),
    getProfile(),
  ])

  const currency = profile?.currency ?? 'USD'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <p className="text-sm text-muted-foreground">{total} registros</p>
        </div>
        <CreateTransactionDialog accounts={accounts} categories={categories} />
      </div>

      <TransactionFilters
        accounts={accounts}
        categories={categories}
        currentFilters={{
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          type: filters.type,
          accountId: filters.accountId,
        }}
      />

      {txns.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText />
            </EmptyMedia>
            <EmptyTitle>Sin transacciones</EmptyTitle>
            <EmptyDescription>
              {total === 0
                ? 'Registra tu primera transacción con el botón de arriba.'
                : 'No hay resultados para los filtros seleccionados.'}
            </EmptyDescription>
          </EmptyHeader>
          {total === 0 && (
            <EmptyContent>
              <CreateTransactionDialog accounts={accounts} categories={categories} />
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <>
          {/* Vista mobile: tarjetas */}
          <div className="flex flex-col gap-2 sm:hidden">
            {txns.map((txn) => (
              <div key={txn.id} className="rounded-lg border bg-card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {txn.description ?? txn.merchant ?? 'Sin descripción'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(txn.date)} · {txn.account.name}
                  </p>
                  {txn.category && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {(() => {
                        const CatIcon = getCategoryIcon(txn.category.icon)
                        return CatIcon
                          ? <CatIcon className="h-3 w-3" style={{ color: txn.category.color ?? undefined }} />
                          : <span>{txn.category.icon}</span>
                      })()}
                      {txn.category.name}
                    </span>
                  )}
                </div>
                <span
                  className={`font-semibold text-sm ${
                    txn.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {txn.type === 'income' ? '+' : '-'}
                  {formatCurrency(txn.amount, txn.account.currency)}
                </span>
                <div className="flex gap-0.5">
                  <EditTransactionDialog transaction={txn} accounts={accounts} categories={categories} />
                  <DeleteTransactionButton transactionId={txn.id} />
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop: tabla */}
          <div className="hidden sm:block rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Descripción</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Cuenta</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Monto</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {txns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(txn.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {txn.description ?? txn.merchant ?? 'Sin descripción'}
                      </p>
                      {txn.merchant && txn.description && (
                        <p className="text-xs text-muted-foreground">{txn.merchant}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {txn.category ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: txn.category.color ?? '#9ca3af' }}
                          />
                          {(() => {
                            const CatIcon = getCategoryIcon(txn.category.icon)
                            return CatIcon
                              ? <CatIcon className="h-3.5 w-3.5" style={{ color: txn.category.color ?? undefined }} />
                              : <span>{txn.category.icon}</span>
                          })()}
                          {txn.category.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: txn.account.color }}
                        />
                        {txn.account.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      <span
                        className={
                          txn.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {txn.type === 'income' ? '+' : '-'}
                        {formatCurrency(txn.amount, txn.account.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <EditTransactionDialog
                          transaction={txn}
                          accounts={accounts}
                          categories={categories}
                        />
                        <DeleteTransactionButton transactionId={txn.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TransactionsPagination currentPage={filters.page} totalPages={pages} />
        </>
      )}
    </div>
  )
}
