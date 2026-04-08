'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlyTrend } from '@/lib/db/actions/dashboard.actions'

interface IncomeExpenseBarProps {
  data: MonthlyTrend[]
  currency: string
}

export function IncomeExpenseBar({ data, currency }: IncomeExpenseBarProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const chartData = data.map((d) => ({
    ...d,
    label: new Intl.DateTimeFormat('es', { month: 'short' })
      .format(new Date(d.month + '-02'))
      .replace('.', ''),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingresos vs Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  className="capitalize"
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value), currency),
                    name === 'income' ? 'Ingresos' : 'Gastos',
                  ]}
                  cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                />
                <Legend
                  formatter={(value) => (value === 'income' ? 'Ingresos' : 'Gastos')}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="income" name="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="expense" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-muted rounded animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
