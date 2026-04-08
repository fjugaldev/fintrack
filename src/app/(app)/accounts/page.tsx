import { Wallet, AlertTriangle } from 'lucide-react'
import { getAccounts } from '@/lib/db/actions/accounts.actions'
import { getProfile } from '@/lib/db/actions/profile.actions'
import { formatCurrency } from '@/lib/format'
import { ACCOUNT_TYPES } from '@/lib/account-types'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CreateAccountDialog } from './_components/create-account-dialog'
import { EditAccountDialog } from './_components/edit-account-dialog'
import { ArchiveAccountButton } from './_components/archive-account-button'

export default async function AccountsPage() {
  const [accounts, profile] = await Promise.all([getAccounts(), getProfile()])
  const currency = profile?.currency ?? 'USD'

  const totalBalance = accounts.reduce(
    (sum, a) => sum + parseFloat(a.balance ?? '0') * parseFloat(a.exchangeRateToBase ?? '1'),
    0,
  )
  const isApproximate = accounts.some((a) => a.currency !== currency)
  const hasUnconfiguredForeignAccounts = accounts.some(
    (a) => a.currency !== currency && !a.exchangeRateToBase,
  )
  const unconfiguredCurrencies = [
    ...new Set(
      accounts
        .filter((a) => a.currency !== currency && !a.exchangeRateToBase)
        .map((a) => a.currency),
    ),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cuentas</h1>
          <p className="text-sm text-muted-foreground">
            {accounts.length} {accounts.length === 1 ? 'cuenta activa' : 'cuentas activas'}
          </p>
        </div>
        <CreateAccountDialog currency={currency} />
      </div>

      {/* Aviso: cuentas extranjeras sin tasa de cambio */}
      {hasUnconfiguredForeignAccounts && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Las cuentas en {unconfiguredCurrencies.join(', ')} no tienen tasa de cambio configurada —
            el Balance neto total las suma como 1:1. Edita la cuenta y configura la tasa para ver el total correcto.
          </span>
        </div>
      )}

      {/* Balance neto total */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Balance neto total</p>
        <p className="text-3xl font-bold mt-1">
          {isApproximate ? '≈ ' : ''}{formatCurrency(totalBalance, currency)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isApproximate ? `Convertido a ${currency}` : 'Todas las cuentas'}
        </p>
      </div>

      {/* Lista de cuentas */}
      {accounts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wallet />
            </EmptyMedia>
            <EmptyTitle>Sin cuentas activas</EmptyTitle>
            <EmptyDescription>Crea tu primera cuenta para comenzar a registrar tus finanzas.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateAccountDialog currency={currency} />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const accountType = ACCOUNT_TYPES.find((t) => t.value === account.type)
            return (
              <div
                key={account.id}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3"
                style={{ borderLeftColor: account.color, borderLeftWidth: 4 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {accountType ? <accountType.icon className="size-5 shrink-0" /> : <span className="text-xl">🏦</span>}
                    <div>
                      <p className="font-semibold leading-tight">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{accountType?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <EditAccountDialog account={account} defaultCurrency={currency} />
                    <ArchiveAccountButton accountId={account.id} accountName={account.name} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(account.balance ?? '0', account.currency)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
