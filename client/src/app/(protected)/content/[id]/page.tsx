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
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, FileVideo, FileImage, Link as LinkIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LoggedInLayout from "@/components/Layout/LoggedInLayout"
import CustomPlayer from "@/components/Utils/CustomPlayer"

interface VerificationResult {
  video_hash: string;
  collective_audio_hash: string;
  is_tampered: boolean;
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
  const [shareableLink, setShareableLink] = useState<string>("")

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
          duration: "2:30", // Example duration
          submissionDate: new Date().toISOString(),
          verificationResult: result,
        })

        // Generate shareable link
        setShareableLink(`${window.location.origin}/verify/${contentId}`)

        // Determine content type
        const contentResponse = await fetch(`https://utfs.io/f/${contentId}`, { method: 'HEAD' })
        const contentTypeHeader = contentResponse.headers.get('Content-Type')
        if (contentTypeHeader?.startsWith('image')) {
          setContentType('image')
        } else if (contentTypeHeader?.startsWith('video')) {
          setContentType('video')
        } else {
          setContentType(null) // Handle other content types
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
        return <Clock className="w-6 h-6 text-yellow-500" />
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-500" />
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => console.error('Failed to copy: ', err))
  }

  if (isLoading) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
        <div className="container mx-auto p-6">
          <Skeleton className="w-[250px] h-[40px] mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </LoggedInLayout>
    )
  }

  if (!verificationData) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
        <div className="container mx-auto p-6">
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Error: No verification data available
            </CardTitle>
            <p className="text-muted-foreground">
              We couldn&apos;t retrieve the verification data for this content. Please try again later or contact support if the issue persists.
            </p>
          </Card>
        </div>
      </LoggedInLayout>
    )
  }

  return (
    <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Content Verification Details</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Content preview */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {contentType === 'video' ? <FileVideo className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                {verificationData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {contentType === 'image' && (
                  <img src={`https://utfs.io/f/${contentId}`} alt="Content" className="max-w-full max-h-full object-contain" />
                )}
                {contentType === 'video' && (
                  <CustomPlayer url={`https://utfs.io/f/${contentId}`} />
                )}
                {!contentType && (
                  <div className="text-muted-foreground">Content preview not available</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Duration: {verificationData.duration}</p>
                <p className="text-sm text-muted-foreground">Submitted: {new Date(verificationData.submissionDate).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Right side - Verification details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(verificationData.status)}
                    Verification Status
                  </span>
                  <Badge variant={verificationData.status === "complete" ? "default" : "destructive"}>
                    {verificationData.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationData.status === "complete" && verificationData.verificationResult && (
                  <Tabs defaultValue="summary">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="share">Share</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                      <div className="mt-4 p-4 rounded-lg bg-muted">
                        <div className="flex items-center justify-between mb-4">
                          {verificationData.verificationResult.is_tampered ? (
                            <>
                              <span className="flex items-center gap-2 text-red-500 font-semibold">
                                <ShieldAlert className="w-6 h-6" />
                                Content Compromised
                              </span>
                              <Badge variant="destructive">TAMPERED</Badge>
                            </>
                          ) : (
                            <>
                              <span className="flex items-center gap-2 text-green-500 font-semibold">
                                <ShieldCheck className="w-6 h-6" />
                                Content Authentic
                              </span>
                              <Badge variant="default">VERIFIED</Badge>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This content has been verified by our system. You can share the verification link to allow others to confirm its authenticity.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="share">
                      <div className="mt-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Share this link with anyone to verify the authenticity of your content:
                        </p>
                        <div className="flex gap-2">
                          <Input value={shareableLink} readOnly />
                          <Button onClick={handleCopyLink}>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {verificationData.status === "pending" && (
                  <div className="flex flex-col items-center gap-4 p-6 mt-4 rounded-lg bg-muted">
                    <Clock className="w-12 h-12 text-yellow-500 animate-pulse" />
                    <h3 className="text-xl font-semibold">Verification in Progress</h3>
                    <p className="text-center text-muted-foreground">
                      Our system is currently analyzing the content. This process ensures the highest level of accuracy in detecting any potential alterations or manipulations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LoggedInLayout>
  )
}