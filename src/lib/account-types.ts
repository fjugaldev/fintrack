import { Banknote, Landmark, PiggyBank, CreditCard, TrendingUp, Bitcoin, type LucideIcon } from 'lucide-react'
import type { NewFinancialAccount } from '@/lib/db/schema'

export const ACCOUNT_TYPES: {
  value: NewFinancialAccount['type']
  label: string
  icon: LucideIcon
}[] = [
  { value: 'cash',        label: 'Efectivo',  icon: Banknote   },
  { value: 'checking',    label: 'Corriente', icon: Landmark   },
  { value: 'savings',     label: 'Ahorro',    icon: PiggyBank  },
  { value: 'credit_card', label: 'Crédito',   icon: CreditCard },
  { value: 'investment',  label: 'Inversión', icon: TrendingUp },
  { value: 'crypto_wallet', label: 'Cripto',  icon: Bitcoin    },
]

export const ACCOUNT_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#eab308', '#84cc16', '#64748b',
  '#0f172a', '#7c3aed',
]
