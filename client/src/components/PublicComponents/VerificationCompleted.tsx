"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerificationResult } from "@/lib/frontend-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ContentIntegrityAlert from "./ContentIntegrityAlert"
import ExistingContentAlert from "./ExistingContentAlert"
import VerificationDetailsTab from "./VerificationDetailsTab"
import GeminiAnalysisTab from "./GeminiAnalysisTab"
import ForgeryAnalysisTab from "./ForgeryAnalysisTab"
import ShareableLink from "./ShareableLink"
import CopyrightApply from "./CopyrightApply"
import { compareHashes, fetchUserInfoByHash } from "@/lib/server/appwrite"

interface VerificationCompletedProps {
  result: VerificationResult
  forgeryResult: any
  isExisting: boolean
  geminiAnalysis: string
  shareableLink: string
}

export default function VerificationCompleted({
  result,
  forgeryResult,
  isExisting,
  geminiAnalysis,
  shareableLink
}: VerificationCompletedProps) {
  const [copyright, setCopyright] = useState(false);
  const [matchingHash, setMatchingHash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCopyright = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const hash = result.image_hash || result.video_hash;
        if (!hash) {
          throw new Error("No hash found in the result");
        }
        const fileType = result.image_hash ? 'image' : 'video';
        
        const userInfoResponse = await fetchUserInfoByHash(hash);
        
        if (userInfoResponse.success) {
          setCopyright(true);
        } else {
          // Only compare hashes if fetchUserInfoByHash was not successful
          const comparisonResult = await compareHashes(hash, fileType);
          if (comparisonResult.data && comparisonResult.data.matching_hash !== "") {
            setCopyright(true);
            setMatchingHash(comparisonResult.data.matching_hash || "");
          }
        }
      } catch (err) {
        console.error("Error checking copyright:", err);
        setError("An error occurred while checking copyright status. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCopyright();
  }, [result]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      className="space-y-4 p-4 px-2 md:px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Content Check Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentIntegrityAlert forgeryResult={forgeryResult} />
          <div className="space-y-4 my-4"></div> 
          {isExisting && copyright ? (
            <ExistingContentAlert hash={matchingHash || result.image_hash || result.video_hash || ""} />
          ) : (
            <CopyrightApply result={result} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid w-full grid-cols-3 ">
              <TabsTrigger value="verification" className="text-xs sm:text-sm">Details</TabsTrigger>
              <TabsTrigger value="gemini" className="text-xs sm:text-sm">Gemini Insights</TabsTrigger>
              <TabsTrigger value="forgery" className="text-xs sm:text-sm">Authenticity</TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="verification">
                <VerificationDetailsTab result={result} />
              </TabsContent>
              <TabsContent value="gemini">
                <GeminiAnalysisTab geminiAnalysis={geminiAnalysis} />
              </TabsContent>
              <TabsContent value="forgery">
                <ForgeryAnalysisTab forgeryResult={forgeryResult} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      <div className="space-y-4 my-4"></div> 
      <Card>
        <CardContent>
          <ShareableLink shareableLink={shareableLink} />
        </CardContent>
      </Card>
    </motion.div>
  )
}