import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { FileInfo } from '@/lib/types'

interface ContentInsightsProps {
  content: FileInfo[]
}

export default function ContentInsights({ content }: ContentInsightsProps) {
  const tamperedCount = content.filter(item => item.tampered).length
  const verifiedCount = content.filter(item => item.verified).length
  const notVerifiedCount = content.filter(item => !item.verified && !item.tampered).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Insights</CardTitle>
        <CardDescription>Overview of your content status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between w-full   gap-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{tamperedCount} tampered item{tamperedCount !== 1 ? 's' : ''}.</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span>{verifiedCount} verified item{verifiedCount !== 1 ? 's' : ''}.</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span>{notVerifiedCount} not verified item{notVerifiedCount !== 1 ? 's' : ''}.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
