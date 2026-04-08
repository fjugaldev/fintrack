import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { ACCOUNT_TYPES } from '@/lib/account-types'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { FinancialAccount } from '@/lib/db/schema'

interface AccountsSummaryProps {
  accounts: FinancialAccount[]
  currency: string
}

export function AccountsSummary({ accounts, currency }: AccountsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cuentas</CardTitle>
        <CardAction>
          <Link href="/accounts" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Ver todas
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.length === 0 ? (
          <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Wallet /></EmptyMedia>
              <EmptyTitle>Sin cuentas activas</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          accounts.slice(0, 5).map((account) => {
            const typeInfo = ACCOUNT_TYPES.find((t) => t.value === account.type)
            return (
              <div key={account.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {typeInfo ? <typeInfo.icon className="size-4 shrink-0 text-muted-foreground" /> : <span className="text-sm">🏦</span>}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums shrink-0">
                  {formatCurrency(account.balance ?? '0', account.currency || currency)}
                </span>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
