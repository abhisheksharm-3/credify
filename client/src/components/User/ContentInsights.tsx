import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react'
import { ContentInsightsProps, InsightItemProps } from '@/lib/frontend-types'

export default function ContentInsights({ verifiedCount, tamperedCount, unverifiedCount }: ContentInsightsProps) {
  const totalCount = verifiedCount + tamperedCount + unverifiedCount
  const InsightItem: React.FC<InsightItemProps> = ({ count, total, label, icon, color }) => (
    <div className={`bg-${color}-50 dark:bg-${color}-900 p-4 rounded-lg flex flex-col items-center justify-center`}>
      <div className={`text-${color}-600 dark:text-${color}-400 mb-2`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <div className={`text-2xl font-bold text-${color}-700 dark:text-${color}-300`}>{count}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightItem
            count={tamperedCount}
            total={totalCount}
            label="Tampered Items"
            icon={<AlertTriangle />}
            color="red"
          />
          <InsightItem
            count={verifiedCount}
            total={totalCount}
            label="Verified Items"
            icon={<CheckCircle2 />}
            color="green"
          />
          <InsightItem
            count={unverifiedCount}
            total={totalCount}
            label="Unverified Items"
            icon={<AlertCircle />}
            color="yellow"
          />
        </div>
      </CardContent>
    </Card>
  )
}