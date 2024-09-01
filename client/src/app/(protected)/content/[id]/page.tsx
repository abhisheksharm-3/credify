"use client"

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, Link as LinkIcon, RefreshCw, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

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
          const next = prev + Math.random() * 10;
          return next > 100 ? 100 : next;
        });
      }, 5000);
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
      .then(() => toast.success("Verification link copied to clipboard"))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const renderContent = (): JSX.Element => {
    switch (status) {
      case VerificationStatus.PENDING:
        return (
          <motion.div 
            className="flex flex-col items-center gap-4 p-6 mt-4 rounded-lg bg-secondary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw className="w-16 h-16 text-primary animate-spin" />
            <h3 className="text-2xl font-semibold">Verification in Progress</h3>
            <p className="text-center text-muted-foreground">
              We&apos;re analyzing your content to ensure its authenticity. This process guarantees the highest level of accuracy.
            </p>
            <Progress value={progress} className="w-full mt-4" />
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
          </motion.div>
        );
      case VerificationStatus.COMPLETE:
        return result ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant={result.is_tampered ? "destructive" : "default"} className="border-2">
              {result.is_tampered ? (
                <>
                  <ShieldAlert className="h-6 w-6" />
                  <AlertTitle className="text-xl font-semibold">Content Compromised</AlertTitle>
                  <AlertDescription className="mt-2 text-lg">
                    Our system has detected potential tampering with this content.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-6 w-6" />
                  <AlertTitle className="text-xl font-semibold">Content Authentic</AlertTitle>
                  <AlertDescription className="mt-2 text-lg">
                    This content has been verified by our system and is deemed authentic.
                  </AlertDescription>
                </>
              )}
            </Alert>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this link to verify the authenticity of your content:
              </p>
              <div className="flex gap-2">
                <Input value={shareableLink} readOnly className="bg-secondary/20" />
                <Button onClick={handleCopyLink} variant="secondary">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </motion.div>
        ) : <></>;
      case VerificationStatus.ERROR:
        return (
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn&apos;t retrieve the verification data. Please try again later or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-2xl mx-auto p-6">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
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
                  <CardTitle className="text-2xl">Verification Details</CardTitle>
                  <Badge variant={status === VerificationStatus.COMPLETE ? "default" : "secondary"} className="animate-pulse">
                    {status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderContent()}
                <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 mr-2" />
                  Your privacy is our priority. We do not store or retain your content after verification.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </LoggedInLayout>
  );
};

export default VerificationDetailPage;