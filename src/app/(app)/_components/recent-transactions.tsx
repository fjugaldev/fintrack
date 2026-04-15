import Link from 'next/link'
import { ReceiptText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoryIcon } from '@/lib/category-icons'
import { formatCurrency, formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { TransactionWithRelations } from '@/lib/db/actions/transactions.actions'

interface RecentTransactionsProps {
  transactions: TransactionWithRelations[]
  currency: string
}

export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimas transacciones</CardTitle>
        <CardAction>
          <Link href="/transactions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Ver todas
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><ReceiptText /></EmptyMedia>
              <EmptyTitle>Sin transacciones recientes</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          transactions.map((txn) => (
            <div key={txn.id} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm"
                style={{ color: txn.category?.color ?? undefined }}
              >
                {(() => {
                  const CatIcon = getCategoryIcon(txn.category?.icon)
                  return CatIcon
                    ? <CatIcon className="h-4 w-4" />
                    : <span>{txn.category?.icon ?? '💸'}</span>
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {txn.description ?? txn.merchant ?? 'Sin descripción'}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
              </div>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums shrink-0',
                  txn.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400',
                )}
              >
                {txn.type === 'income' ? '+' : '-'}
                {formatCurrency(txn.amount, txn.account.currency)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
