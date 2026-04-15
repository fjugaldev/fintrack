import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  sublabel?: string
  valueClassName?: string
  icon?: React.ReactNode
}

export function StatCard({ label, value, sublabel, valueClassName, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {label}
          </CardDescription>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn('text-2xl font-bold tabular-nums', valueClassName)}>{value}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
