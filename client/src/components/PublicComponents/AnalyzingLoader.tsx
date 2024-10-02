"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const taglines = [
  "Verifying content integrity...",
  "Checking for quality assurance...",
  "Ensuring compliance with guidelines...",
  "Processing your submission...",
  "Analyzing data consistency...",
  "Validating user information...",
  "Optimizing for best performance...",
  "Preparing for final review..."
]

export default function AnalyzingSection() {
  const [currentTagline, setCurrentTagline] = useState(taglines[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline(prevTagline => {
        const currentIndex = taglines.indexOf(prevTagline)
        const nextIndex = (currentIndex + 1) % taglines.length
        return taglines[nextIndex]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="mb-8 min-h-[300px] flex items-center justify-center shadow-custom">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div>
            <h3 className="text-2xl font-semibold mb-2">Verifying Content</h3>
            <p className="text-muted-foreground max-w-sm">
              Please wait while we analyze your content. This process may take a few moments.
            </p>
          </div>
          <p className="text-sm font-medium text-primary animate-pulse">
            {currentTagline}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}