"use client"
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { toast } from "sonner";
import { useForgeryDetection } from "@/hooks/useForgeryDetection";
import { VerificationResult, VerificationStatus } from "@/lib/frontend-types";
import VerificationInProgress from "@/components/PublicComponents/VerificationInProgress";
import VerificationCompleted from "@/components/PublicComponents/VerificationCompleted";
import VerificationError from "@/components/PublicComponents/VerificationError";
import PrivacyNotice from "@/components/PublicComponents/PrivacyNotice";

export default function ContentVerification() {
  const params = useParams();
  const contentId = params.id as string;
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>("");
  const [isExisting, setIsExisting] = useState<boolean>(false);
  const { forgeryResult, fetchForgeryData } = useForgeryDetection(contentId);
  
  // Use refs to track polling state
  const pollingRef = useRef<{
    isPolling: boolean;
    attempts: number;
    timeoutId?: NodeJS.Timeout;
  }>({
    isPolling: false,
    attempts: 0
  });

  const MAX_POLL_ATTEMPTS = 120; // 10 minutes (120 * 5 seconds)
  const POLL_INTERVAL = 5000; // 5 seconds

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
        setResult(data.result);
        const contentHash = data.result?.image_hash || data.result?.video_hash;
        setShareableLink(`${window.location.origin}/verify/${contentHash}`);
        return true;
      } else if (data.status === 'error') {
        toast.error(data.message || "Verification failed");
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error fetching verification data:', error);
      return false;
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

  const stopPolling = useCallback(() => {
    if (pollingRef.current.timeoutId) {
      clearTimeout(pollingRef.current.timeoutId);
    }
    pollingRef.current.isPolling = false;
  }, []);

  const startPolling = useCallback(() => {
    if (pollingRef.current.isPolling) return;

    pollingRef.current.isPolling = true;
    pollingRef.current.attempts = 0;

    const poll = async () => {
      if (!pollingRef.current.isPolling) return;

      const [verificationDone, forgeryDone] = await Promise.all([
        fetchVerificationData(),
        fetchForgeryData()
      ]);

      if (verificationDone && forgeryDone) {
        await deleteVerifiedContent(contentId);
        setProgress(100);
        setStatus('completed');
        stopPolling();
        return;
      }

      pollingRef.current.attempts++;
      setProgress(Math.min((pollingRef.current.attempts / MAX_POLL_ATTEMPTS) * 100, 95));

      if (pollingRef.current.attempts >= MAX_POLL_ATTEMPTS) {
        setStatus('error');
        toast.error("Verification timed out");
        stopPolling();
        return;
      }

      if (pollingRef.current.isPolling) {
        pollingRef.current.timeoutId = setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();
  }, [contentId, fetchVerificationData, fetchForgeryData, stopPolling]);

  useEffect(() => {
    if (status === 'pending') {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [status, startPolling, stopPolling]);

  const renderContent = (): JSX.Element => {
    if (status === 'pending') {
      return <VerificationInProgress progress={progress} />;
    } else if (status === 'completed' && result) {
      return (
        <VerificationCompleted 
          result={result}
          forgeryResult={forgeryResult}
          isExisting={isExisting}
          geminiAnalysis={geminiAnalysis}
          shareableLink={shareableLink}
        />
      );
    } else if (status === 'error') {
      return <VerificationError />;
    }
    return <></>;
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
                <PrivacyNotice />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </LoggedInLayout>
  );
}