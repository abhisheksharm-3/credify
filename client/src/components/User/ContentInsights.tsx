import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Content } from '@/lib/types'

interface ContentInsightsProps {
  content: Content[]
}

export default function ContentInsights({ content }: ContentInsightsProps) {
  const draftCount = content.filter(item => item.status === 'Draft').length
  const reviewCount = content.filter(item => item.status === 'Under Review').length
  const publishedCount = content.filter(item => item.status === 'Published').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Insights</CardTitle>
        <CardDescription>Overview of your content performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 text-yellow-600">
            <Clock className="w-5 h-5" />
            <span>{draftCount} draft item{draftCount !== 1 ? 's' : ''} waiting to be reviewed.</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <AlertCircle className="w-5 h-5" />
            <span>{reviewCount} item{reviewCount !== 1 ? 's' : ''} under review.</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span>{publishedCount} published item{publishedCount !== 1 ? 's' : ''}.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}