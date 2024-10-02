import { useState, useCallback } from 'react';
import { VerificationResultType, User, UseContentVerificationReturn } from '@/lib/types';

export function useContentVerification(): UseContentVerificationReturn {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResultType | null>(null);
    const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchWithErrorHandling = useCallback(async (url: string, options?: RequestInit) => {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }, []);

    const deleteVerifiedContent = useCallback(async (id: string): Promise<void> => {
        try {
            await fetchWithErrorHandling('/api/content/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            console.log('Content deleted successfully');
        } catch (error) {
            console.error('Error deleting verified content:', error);
        }
    }, [fetchWithErrorHandling]);

    const handleUploadComplete = useCallback(async (res: { key: string; url: string; name: string }[]) => {
        if (!res || res.length === 0) return;

        setIsAnalyzing(true);
        setError(null);
        const contentId = res[0].key;

        try {
            const data = await fetchWithErrorHandling(`/api/content/analyze/${contentId}`);

            const result: VerificationResultType = {
                verified: data.status === 'found',
                status: data.status,
                message: data.message,
                uploader: data.creatorsId.userId,
                timestamp: data.verificationResult?.timestamp,
            };

            setVerificationResult(result);
            setVerificationComplete(true);

            if (result.verified) {
                const lineageData = await fetchWithErrorHandling(`/api/content/get-lineage/${data.contentHash}`);
                setUploaderHierarchy(lineageData.uploaderHierarchy);
            }
        } catch (error) {
            console.error('Error during verification:', error);
            setError("Failed to verify content. Please try again later.");
        } finally {
            setIsAnalyzing(false);
            await deleteVerifiedContent(contentId);
        }
    }, [fetchWithErrorHandling, deleteVerifiedContent]);

    const resetVerification = useCallback(() => {
        setVerificationComplete(false);
        setVerificationResult(null);
        setUploaderHierarchy(null);
        setError(null);
    }, []);

    return {
        isAnalyzing,
        verificationComplete,
        verificationResult,
        uploaderHierarchy,
        error,
        handleUploadComplete,
        resetVerification,
    };
}