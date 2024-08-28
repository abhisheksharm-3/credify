"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert } from "lucide-react"
import LoggedInayout from "@/components/Layout/LoggedInLayout"
import CustomPlayer from "@/components/Utils/CustomPlayer"

interface VerificationResult {
  video_hash: string;
  collective_audio_hash: string;
  is_tampered: boolean;
  tamper_score: number;
}

interface VerificationData {
  status: "pending" | "complete";
  title: string;
  duration: string;
  submissionDate: string;
  verificationResult: VerificationResult | null;
}

export default function VerificationDetailPage() {
  const params = useParams()
  const contentId = params.id as string

  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contentType, setContentType] = useState<"image" | "video" | null>(null)

  useEffect(() => {
    const fetchVerificationData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/content/get-phash', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contentId }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch verification data')
        }

        const result: VerificationResult = await response.json()

        setVerificationData({
          status: "complete",
          title: `Content ${contentId}`,
          duration: "Unknown",
          submissionDate: new Date().toISOString(),
          verificationResult: result,
        })

        // Determine content type
        const contentResponse = await fetch(`https://utfs.io/f/${contentId}`, { method: 'HEAD' })
        const contentTypeHeader = contentResponse.headers.get('Content-Type')
        if (contentTypeHeader?.startsWith('image')) {
          setContentType('image')
        } else if (contentTypeHeader?.startsWith('video')) {
          setContentType('video')
        }
      } catch (error) {
        console.error('Error fetching verification data:', error)
        setVerificationData({
          status: "pending",
          title: `Content ${contentId}`,
          duration: "Unknown",
          submissionDate: new Date().toISOString(),
          verificationResult: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerificationData()
  }, [contentId])

  const getStatusIcon = (status: VerificationData['status']) => {
    switch (status) {
      case "pending":
        return <Clock className="w-6 h-6 text-muted-foreground" />
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-500" />
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!verificationData) {
    return <div>Error: No verification data available</div>
  }

  return (
    <LoggedInayout className="min-h-screen flex flex-col justify-start">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Content Verification Details</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Content preview */}
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  {contentType === 'image' && (
                    <img src={`https://utfs.io/f/${contentId}`} alt="Content" className="max-w-full max-h-full object-contain" />
                  )}
                  {contentType === 'video' && (
                    <CustomPlayer url={`https://utfs.io/f/${contentId}`} />
                  )}
                  {!contentType && (
                    <div className="text-muted-foreground">Content not available</div>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{verificationData.title}</h2>
                <p className="text-muted-foreground">Duration: {verificationData.duration}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Verification details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(verificationData.status)}
                  Verification Status: {verificationData.status.charAt(0).toUpperCase() + verificationData.status.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Submission Date: {new Date(verificationData.submissionDate).toLocaleString()}</p>
                
                {verificationData.status === "complete" && verificationData.verificationResult && (
                  <>
                    <div className="mb-4">
                      <p className="font-semibold text-green-500 mb-2">Verification Complete</p>
                      <p>Video Hash: {verificationData.verificationResult.video_hash}</p>
                      <p>Audio Hash: {verificationData.verificationResult.collective_audio_hash}</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full mt-4">
                      <AccordionItem value="verification-result">
                        <AccordionTrigger>Verification Result</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center gap-2 p-3 mt-4 rounded-md bg-muted">
                            {verificationData.verificationResult.is_tampered ? (
                              <>
                                <ShieldAlert className="w-6 h-6 text-red-500" />
                                <span className="font-semibold">Content Authenticity Compromised</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-6 h-6 text-green-500" />
                                <span className="font-semibold">Certified Original Content</span>
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}

                {verificationData.status === "pending" && (
                  <div className="flex items-center gap-2 p-3 mt-4 rounded-md bg-muted">
                    <Clock className="w-6 h-6 text-yellow-500" />
                    <span className="font-semibold">Verification Pending</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LoggedInayout>
  )
}