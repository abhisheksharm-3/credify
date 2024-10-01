/* import React from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationResult } from "@/lib/frontend-types";
import ContentIntegrityAlert from "./ContentIntegrityAlert";
import ExistingContentAlert from "./ExistingContentAlert";
import VerificationDetailsTab from "./VerificationDetailsTab";
import GeminiAnalysisTab from "./GeminiAnalysisTab";
import ForgeryAnalysisTab from "./ForgeryAnalysisTab";
import ShareableLink from "./ShareableLink";

interface VerificationCompletedProps {
  result: VerificationResult;
  forgeryResult: any;
  isExisting: boolean;
  geminiAnalysis: string;
  shareableLink: string;
}

export default function VerificationCompleted({
  result,
  forgeryResult,
  isExisting,
  geminiAnalysis,
  shareableLink
}: VerificationCompletedProps) {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ContentIntegrityAlert forgeryResult={forgeryResult} />
      {isExisting && <ExistingContentAlert />}
      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 mb-4 m-4">
          <TabsTrigger value="verification" className="px-2 py-1 text-xs sm:text-sm">Verification</TabsTrigger>
          <TabsTrigger value="gemini" className="px-2 py-1 text-xs sm:text-sm">Gemini Analysis</TabsTrigger>
          <TabsTrigger value="forgery" className="px-2 py-1 text-xs sm:text-sm">Forgery Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="verification">
          <VerificationDetailsTab result={result} />
        </TabsContent>
        <TabsContent value="gemini">
          <GeminiAnalysisTab geminiAnalysis={geminiAnalysis} />
        </TabsContent>
        <TabsContent value="forgery">
          <ForgeryAnalysisTab forgeryResult={forgeryResult} />
        </TabsContent>
      </Tabs>
      <ShareableLink shareableLink={shareableLink} />
    </motion.div>
  );
}

 */
"use client"

import React from "react"
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
  return (
    <motion.div
      className="space-y-4 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Verification Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentIntegrityAlert forgeryResult={forgeryResult} />
          <div className="space-y-4 my-4"></div> 
          {isExisting && <ExistingContentAlert />}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid w-full grid-cols-3 ">
              <TabsTrigger value="verification" className="text-xs sm:text-sm">Verification</TabsTrigger>
              <TabsTrigger value="gemini" className="text-xs sm:text-sm">Gemini Analysis</TabsTrigger>
              <TabsTrigger value="forgery" className="text-xs sm:text-sm">Forgery Analysis</TabsTrigger>
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