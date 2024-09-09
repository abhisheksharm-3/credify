"use client"

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, Link as LinkIcon, RefreshCw, Lock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

enum VerificationStatus {
  PENDING = "pending",
  COMPLETE = "complete",
  ERROR = "error"
}

interface VerificationResult {
  video_hash?: string;
  collective_audio_hash?: string;
  image_hash?: string;
  audio_hash?: string;
  frame_hash?: string;
  is_tampered?: boolean;
}

const VerificationDetailPage: React.FC = () => {
  const params = useParams();
  const contentId = params.id as string;

  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.PENDING);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        const response = await fetch('/api/content/getTag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId }),
        });

        if (!response.ok) throw new Error('Failed to fetch verification data');

        const data: VerificationResult = await response.json();
        setStatus(VerificationStatus.COMPLETE);
        setResult(data);
        const contentHash = data.image_hash || data.video_hash;
        setShareableLink(`${window.location.origin}/verify/${contentHash}`);

        if (data && !data.is_tampered) {
          await deleteVerifiedContent(contentId);
        }
      } catch (error) {
        console.error('Error fetching verification data:', error);
        setStatus(VerificationStatus.ERROR);
      }
    };

    const simulateProgress = () => {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 5;
          return next > 95 ? 95 : next;
        });
      }, 3000);
      return () => clearInterval(interval);
    };

    fetchVerificationData();
    const cleanup = simulateProgress();
    return cleanup;
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
      case VerificationStatus.PENDING:
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
      case VerificationStatus.COMPLETE:
        return result ? (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant={result.is_tampered ? "destructive" : "default"} className="border-2 shadow-lg">
              {result.is_tampered ? (
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
      case VerificationStatus.ERROR:
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
      <div className="container max-w-3xl mx-auto p-6">
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
                  <Badge variant={status === VerificationStatus.COMPLETE ? "default" : "secondary"} className="animate-pulse text-sm py-1 px-3">
                    {status === VerificationStatus.PENDING ? "IN PROGRESS" : status.toUpperCase()}
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
};

export default VerificationDetailPage;