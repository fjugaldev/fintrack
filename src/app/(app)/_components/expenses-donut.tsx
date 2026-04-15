'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryExpense } from '@/lib/db/actions/dashboard.actions'

interface ExpensesDonutProps {
  data: CategoryExpense[]
  currency: string
}

export function ExpensesDonut({ data, currency }: ExpensesDonutProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gastos por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            Sin gastos registrados este mes
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="h-[180px] w-[180px] shrink-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="categoryName"
                      strokeWidth={0}
                    >
                      {data.map((entry) => (
                        <Cell key={entry.categoryId} fill={entry.categoryColor} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value), currency),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-full bg-muted animate-pulse" />
              )}
            </div>

            {/* Leyenda */}
            <div className="flex-1 space-y-2 min-w-0">
              {data.map((item) => (
                <div key={item.categoryId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <span className="text-xs truncate">{item.categoryName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {total > 0 ? ((item.total / total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
