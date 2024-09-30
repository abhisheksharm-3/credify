"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ShieldCheck, ShieldAlert, Link as LinkIcon, RefreshCw, Lock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForgeryDetection } from "@/hooks/useForgeryDetection";


type VerificationStatus = 'pending' | 'completed' | 'error';

interface VerificationResult {
  video_hash?: string;
  collective_audio_hash?: string;
  image_hash?: string;
  audio_hash?: string;
  frame_hash?: string;
}

export default function Component() {
  const params = useParams();
  const contentId = params.id as string;

  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>("");
  const [isExisting, setIsExisting] = useState<boolean>(false);
  const { forgeryResult, fetchForgeryData } = useForgeryDetection(contentId);

  const fetchVerificationData = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/content/getTag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });

      if (!response.ok) throw new Error('Failed to fetch verification data');

      const data = await response.json();
      setGeminiAnalysis(data.geminiAnalysis || "");
      setIsExisting(data.existing || false);

      if (data.status === 'completed') {
        setStatus('completed');
        setResult(data.result);
        const contentHash = data.result?.image_hash || data.result?.video_hash;
        setShareableLink(`${window.location.origin}/verify/${contentHash}`);
        return true; // Verification complete
      } else if (data.status === 'error') {
        setStatus('error');
        toast.error(data.message || "Verification failed");
        return true; // Verification failed
      } else {
        return false; // Still pending
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
      setStatus('error');
      return true; // Error occurred
    }
  }, [contentId]);

  const deleteVerifiedContent = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/content/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete verified content');

      console.log('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting verified content:', error);
    }
  };

  useEffect(() => {
    const pollInterval = 5000; // Poll every 5 seconds
    const maxAttempts = 120; // Maximum 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      // Step 1: Verification
      const verificationComplete = await fetchVerificationData();
      if (!verificationComplete) {
        attempts++;
        setProgress(Math.min((attempts / maxAttempts) * 100, 95));
        setTimeout(poll, pollInterval);
        return;
      }
      // Step 2: Forgery Detection
      const forgeryComplete = await fetchForgeryData();
      if (!forgeryComplete) {
        attempts++;
        setProgress(Math.min((attempts / maxAttempts) * 100, 95));
        setTimeout(poll, pollInterval);
        return;
      }

      // Step 3: Deletion
      await deleteVerifiedContent(contentId);

      setProgress(100);
    };

    poll(); // Start polling

    return () => {
      // Cleanup if needed
    };
  }, [contentId, fetchVerificationData, fetchForgeryData]);

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        setIsLinkCopied(true);
        toast.success("Verification link copied to clipboard", {
          description: "You can now share this link with others to verify your content.",
        });
        setTimeout(() => setIsLinkCopied(false), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy link", {
          description: "Please try again or copy the link manually.",
        });
      });
  };

  const renderContent = (): JSX.Element => {
    switch (status) {
      case 'pending':
        return (
          <motion.div
            className="flex flex-col items-center gap-6 p-8 mt-4 rounded-lg bg-secondary/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw className="w-20 h-20 text-primary animate-spin" />
            <h3 className="text-3xl font-semibold">Verification in Progress</h3>
            <p className="text-center text-muted-foreground max-w-md">
              We're meticulously analyzing your content to ensure its authenticity. This process guarantees the highest level of accuracy and integrity.
            </p>
            <Progress value={progress} className="w-full mt-4" />
            <p className="text-sm font-medium text-muted-foreground">{Math.round(progress)}% Complete</p>
          </motion.div>
        );
      case 'completed':
        return result ? (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant={forgeryResult?.isManipulated ? "destructive" : "default"} className="border-2 shadow-lg">
              {forgeryResult?.isManipulated ? (
                <>
                  <ShieldAlert className="h-8 w-8" />
                  <AlertTitle className="text-2xl font-semibold mb-2">Content Integrity Alert</AlertTitle>
                  <AlertDescription className="text-lg">
                    Our advanced system has detected potential tampering with this content. We recommend further investigation and verification.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-8 w-8" />
                  <AlertTitle className="text-2xl font-semibold mb-2">Content Authenticity Confirmed</AlertTitle>
                  <AlertDescription className="text-lg">
                    Our rigorous verification process has confirmed the authenticity of this content. You can trust its integrity.
                  </AlertDescription>
                </>
              )}
            </Alert>
            {isExisting && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Existing Content</AlertTitle>
                <AlertDescription>
                  This content has been previously verified, either by you or another user.
                </AlertDescription>
              </Alert>
            )}
            <Tabs defaultValue="verification" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="gemini">Gemini Analysis</TabsTrigger>
                <TabsTrigger value="forgery">Forgery Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="verification">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.video_hash && <li><strong>Video Hash:</strong> {result.video_hash}</li>}
                      {result.collective_audio_hash && <li><strong>Collective Audio Hash:</strong> {result.collective_audio_hash}</li>}
                      {result.image_hash && <li><strong>Image Hash:</strong> {result.image_hash}</li>}
                      {result.audio_hash && <li><strong>Audio Hash:</strong> {result.audio_hash}</li>}
                      {result.frame_hash && <li><strong>Frame Hash:</strong> {result.frame_hash}</li>}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="gemini">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <svg fill="none" width={"24"} height={"24"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)" /><defs><radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"><stop offset=".067" stop-color="#9168C0" /><stop offset=".343" stop-color="#5684D1" /><stop offset=".672" stop-color="#1BA1E3" /></radialGradient></defs></svg>
                      Gemini Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {typeof geminiAnalysis === "string" && geminiAnalysis.length > 0 ? (
                      <p className="whitespace-pre-wrap">{geminiAnalysis}</p>
                    ) : (
                      <p className="text-muted-foreground">No Gemini analysis available for this content.</p>
                    )}

                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="forgery">
                <Card>
                  <CardHeader>
                    <CardTitle>Forgery Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {forgeryResult ? (
                      <div className="space-y-4">
                        <Alert variant={forgeryResult.isManipulated ? "destructive" : "default"}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>
                            {forgeryResult.isManipulated ? "Potential Tampering Detected" : "No Tampering Detected"}
                          </AlertTitle>
                          <AlertDescription>
                            Content Type: {forgeryResult.contentType || "Unknown"}
                            {forgeryResult.manipulationProbability !== undefined && (
                              <p>Manipulation Probability: {(forgeryResult.manipulationProbability * 100).toFixed(2)}%</p>
                            )}
                            {forgeryResult.detectionMethods && (
                              <div>
                                <p className="mt-2">Detection methods confirmed:</p>
                                <ul className="list-disc ml-6">
                                  {forgeryResult.detectionMethods.imageManipulation && <li>Image Manipulation</li>}
                                  {forgeryResult.detectionMethods.ganGenerated && <li>GAN Generated</li>}
                                  {forgeryResult.detectionMethods.faceManipulation && <li>Face Manipulation</li>}
                                  {forgeryResult.detectionMethods.audioDeepfake && <li>Audio Deepfake</li>}
                                </ul>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Forgery analysis data is not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Share Verification Result</h4>
              <p className="text-sm text-muted-foreground">
                Use this secure link to allow others to verify the authenticity of your content:
              </p>
              <div className="flex gap-2">
                <Input value={shareableLink} readOnly className="bg-secondary/10 font-mono text-sm" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleCopyLink} variant="secondary" className="min-w-[100px]">
                        {isLinkCopied ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <LinkIcon className="w-4 h-4 mr-2" />
                        )}
                        {isLinkCopied ? "Copied!" : "Copy Link"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isLinkCopied ? "Link copied to clipboard" : "Copy verification link"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </motion.div>
        ) : <></>;
      case 'error':
        return (
          <Alert variant="destructive" className="animate-pulse shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <AlertTitle className="text-xl font-semibold mb-2">Verification Process Interrupted</AlertTitle>
            <AlertDescription className="text-base">
              We encountered an issue while retrieving the verification data. Please try again in a few moments or contact our support team if the problem persists.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-4xl mx-auto p-6">
        <motion.h1
          className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Content Verification
        </motion.h1>
        <AnimatePresence>
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-semibold">Verification Details</CardTitle>
                  <Badge
                    variant={status === 'completed' ? "default"
                      : status === 'error' ? "destructive" : "secondary"}
                    className="animate-pulse text-sm py-1 px-3"
                  >
                    {status === 'pending' ? "IN PROGRESS" : status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderContent()}
                <motion.div
                  className="mt-8 flex items-center justify-center text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Lock className="w-5 h-5 mr-3 text-primary" />
                  <span>Your privacy is our utmost priority. We do not store or retain your content after the verification process is complete.</span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </LoggedInLayout>
  );
}