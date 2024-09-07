'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import UploadSection from '@/components/PublicComponents/PublicAnalyzeUpload';
import AnalyzingSection from '@/components/PublicComponents/AnalyzingLoader';
import ErrorSection from '@/components/PublicComponents/Error';
import VerificationResultSection from '@/components/PublicComponents/VerificationResultSection';
import { VerificationResult, User } from '@/lib/types';

export default function ContentVerificationPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = async (res: { key: string; url: string; name: string }[]) => {
    if (res && res.length > 0) {
      setIsAnalyzing(true);
      setError(null); 
      const contentId = res[0].key;
      try {
        const response = await fetch(`/api/content/analyze/${contentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        const result: VerificationResult = {
          verified: data.status === 'found',
          status: data.status,
          message: data.message,
          uploader: data.verificationResult?.uploader,
          timestamp: data.verificationResult?.timestamp,
          isTampered: data.status === 'not_found'
        };

        setVerificationResult(result);
        setVerificationComplete(true);
        const contentHash = data.contentHash;

        if (result.verified) {
          const lineageResponse = await fetch(`/api/content/get-lineage/${contentHash}`);
          if (lineageResponse.ok) {
            const lineageData = await lineageResponse.json();
            setUploaderHierarchy(lineageData.uploaderHierarchy);
          }
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setError("Failed to verify content. Please try again later.");
      } finally {
        setIsAnalyzing(false);
        await deleteVerifiedContent(contentId);
      }
    }
  };

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

  const resetVerification = () => {
    setVerificationComplete(false);
    setVerificationResult(null);
  };

  return (
    <Layout className="min-h-screen flex justify-start flex-col">
      <div className="container max-w-3xl mx-auto p-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Content Verification
        </motion.h1>

        {!verificationComplete && (
          <UploadSection onUploadComplete={handleUploadComplete} onUploadError={setError} />
        )}

        {isAnalyzing && <AnalyzingSection />}

        {error && <ErrorSection error={error} />}

        <AnimatePresence>
          {verificationComplete && verificationResult && (
            <VerificationResultSection
              verificationResult={verificationResult}
              uploaderHierarchy={uploaderHierarchy}
              onResetVerification={resetVerification}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}