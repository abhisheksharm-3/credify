"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface VerificationResult {
  video_hash: string;
  collective_audio_hash: string;
  is_tampered: boolean;
}

interface VerificationData {
  status: "pending" | "complete";
  title: string;
  submissionDate: string;
  verificationResult: VerificationResult | null;
}

export default function VerificationDetailPage() {
  const params = useParams();
  const contentId = params.id as string;

  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchVerificationData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/content/getTag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId }),
        });

        if (!response.ok) throw new Error('Failed to fetch verification data');

        const result: VerificationResult = await response.json();

        setVerificationData({
          status: "complete",
          title: `Content ${contentId}`,
          submissionDate: new Date().toISOString(),
          verificationResult: result,
        });

        setShareableLink(`${window.location.origin}/verify/${contentId}`);

        if (result && !result.is_tampered) {
          await deleteVerifiedContent(contentId);
        }
      } catch (error) {
        console.error('Error fetching verification data:', error);
        setVerificationData({
          status: "pending",
          title: `Content ${contentId}`,
          submissionDate: new Date().toISOString(),
          verificationResult: null,
        });
        simulateProgress();
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationData();
  }, [contentId]);

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setProgress(progress);
    }, 500);
  };

  const deleteVerifiedContent = async (id: string) => {
    try {
      const response = await fetch(`/api/content/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contentId }),
      });

      if (!response.ok) throw new Error('Failed to delete verified content');

      setIsDeleted(true);
      console.log('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting verified content:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => console.log("Link copied to clipboard"))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  if (isLoading) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-2xl mx-auto p-6">
          <Skeleton className="w-[250px] h-[40px] mb-8 mx-auto" />
          <Card className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 shadow-xl">
            <CardHeader>
              <Skeleton className="h-[28px] w-3/4 mb-2" />
              <Skeleton className="h-[20px] w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[100px] w-full mb-4" />
              <Skeleton className="h-[40px] w-full" />
            </CardContent>
          </Card>
        </div>
      </LoggedInLayout>
    );
  }

  if (!verificationData) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-2xl mx-auto p-6">
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn't retrieve the verification data for this content. Please try again later or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        </div>
      </LoggedInLayout>
    );
  }

  return (
    <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-2xl mx-auto p-6">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Content Verification Details
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">{verificationData.title}</CardTitle>
                <Badge variant={verificationData.status === "complete" ? "default" : "secondary"} className="animate-pulse">
                  {verificationData.status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Submitted: {new Date(verificationData.submissionDate).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationData.status === "complete" && verificationData.verificationResult && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Alert variant={verificationData.verificationResult.is_tampered ? "destructive" : "default"} className="border-2">
                    {verificationData.verificationResult.is_tampered ? (
                      <>
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                        <AlertTitle className="text-xl font-semibold">Content Compromised</AlertTitle>
                        <AlertDescription className="mt-2 text-lg">
                          Our system has detected potential tampering with this content.
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-6 w-6 text-green-500" />
                        <AlertTitle className="text-xl font-semibold">Content Authentic</AlertTitle>
                        <AlertDescription className="mt-2 text-lg">
                          This content has been verified by our system and is deemed authentic.
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                  {isDeleted ? (
                    <Alert>
                      <AlertTitle className="text-lg font-semibold">Content Deleted</AlertTitle>
                      <AlertDescription className="mt-2">
                        The content has been automatically deleted after verification.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Share this link to verify the authenticity of your content:
                      </p>
                      <div className="flex gap-2">
                        <Input value={shareableLink} readOnly className="bg-gray-100 dark:bg-gray-700" />
                        <Button onClick={handleCopyLink} className="bg-blue-500 hover:bg-blue-600 text-white">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {verificationData.status === "pending" && (
                <motion.div 
                  className="flex flex-col items-center gap-4 p-6 mt-4 rounded-lg bg-gray-100 dark:bg-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Verification in Progress</h3>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Our system is currently analyzing the content. This process ensures the highest level of accuracy in detecting any potential alterations or manipulations.
                  </p>
                  <Progress value={progress} className="w-full mt-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}% Complete</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LoggedInLayout>
  );
}