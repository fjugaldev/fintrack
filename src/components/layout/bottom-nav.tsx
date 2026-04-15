'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, ArrowLeftRight, PieChart } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard, enabled: true },
  { href: '/accounts', label: 'Cuentas', icon: Wallet, enabled: true },
  { href: '/transactions', label: 'Movimientos', icon: ArrowLeftRight, enabled: true },
  { href: '/budgets', label: 'Presupuesto', icon: PieChart, enabled: true },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return item.enabled ? (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <span
              key={item.href}
              className="flex flex-col items-center gap-1 flex-1 py-2 text-xs text-muted-foreground opacity-40 cursor-not-allowed"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </span>
          )
        })}
      </div>
    </nav>
  )
}
