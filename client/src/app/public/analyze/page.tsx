'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/Layout/Layout'
import UploadSection from '@/components/PublicComponents/PublicAnalyzeUpload'
import AnalyzingSection from '@/components/PublicComponents/AnalyzingLoader'
import ErrorSection from '@/components/PublicComponents/Error'
import VerificationResultSection from '@/components/PublicComponents/VerificationResultSection'
import { VerificationResultType, User } from '@/lib/types'
import { useForgeryDetection } from '@/hooks/useForgeryDetection'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const POLLING_INTERVAL = 5000

export default function ContentVerificationPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResultType | null>(null)
  const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contentId, setContentId] = useState<string>("")
  const { forgeryResult, fetchForgeryData } = useForgeryDetection(
    contentId ? contentId : ""
  )

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    const maxAttempts = 120
    let attempts = 0

    const pollAnalysis = async () => {
      if (contentId && isAnalyzing) {
        try {
          const response = await fetch(`/api/content/analyze/${contentId}`)
          if (!response.ok) throw new Error('Failed to fetch data')
          const data = await response.json()

          if (data.status !== 'pending') {
            const forgeryComplete = await fetchForgeryData()

            if (!forgeryComplete && attempts < maxAttempts) {
              attempts++
              return // Continue polling
            }

            clearInterval(intervalId)
            setIsAnalyzing(false)

            const result: VerificationResultType = {
              verified: data.status === 'found',
              status: data.status,
              message: data.message,
              timestamp: data.timestamp,
              uploader: data.uploader,
              
            }
            

            setVerificationResult(result)
            setVerificationComplete(true)

            if (result.verified) {
              await fetchUploaderHierarchy(data.contentHash)
            }

            await deleteVerifiedContent(contentId)
          }
        } catch (error) {
          clearInterval(intervalId)
          setIsAnalyzing(false)
          toast.error('Error during verification')
          setError("Oops, it looks like there was an issue verifying your content. Please try again later.")
        }
      }
    }

    if (contentId && isAnalyzing) {
      intervalId = setInterval(pollAnalysis, POLLING_INTERVAL)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [contentId, isAnalyzing, fetchForgeryData])

  const handleUploadComplete = async (res: { key: string; url: string; name: string }[]) => {
    if (res && res.length > 0) {
      setIsAnalyzing(true)
      setError(null)
      setContentId(res[0].key)
    }
  }

  const fetchUploaderHierarchy = async (contentHash: string) => {
    try {
      const lineageResponse = await fetch(`/api/content/get-lineage/${contentHash}`)
      if (lineageResponse.ok) {
        const lineageData = await lineageResponse.json()
        console.log("lineage data",lineageData);
        setUploaderHierarchy(lineageData.uploaderHierarchy)
      }
    } catch (error) {
      console.error('Error fetching uploader hierarchy:', error)
    }
  }

  const deleteVerifiedContent = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/content/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) throw new Error('Failed to delete verified content')
    } catch (error) {
    }
  }

  const resetVerification = () => {
    setVerificationComplete(false)
    setVerificationResult(null)
    setContentId("")
  }

  return (
    <Layout className="min-h-screen flex justify-start flex-col">
      <div className="container max-w-3xl mx-auto p-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Verify Your Content
        </motion.h1>

        {!verificationComplete && (
          <UploadSection
            onUploadComplete={handleUploadComplete}
            onUploadError={(error) => setError("Oops, it looks like there was an issue uploading your file. Please try again.")}
          />
        )}

        {isAnalyzing && <AnalyzingSection />}

        {error && <ErrorSection error={error} />}

        <AnimatePresence>
          {verificationComplete && verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs defaultValue="verification" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>
                <TabsContent value="verification">
                  <VerificationResultSection
                    verificationResult={verificationResult}
                    uploaderHierarchy={uploaderHierarchy}
                    onResetVerification={resetVerification}
                    forgeryResult={forgeryResult}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}