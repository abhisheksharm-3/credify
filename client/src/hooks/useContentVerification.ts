import { useState } from 'react';
import { VerificationResult, User } from '@/lib/types';

interface UseContentVerificationReturn {
    isAnalyzing: boolean;
    verificationComplete: boolean;
    verificationResult: VerificationResult | null;
    uploaderHierarchy: User | null;
    error: string | null;
    handleUploadComplete: (res: { key: string; url: string; name: string }[]) => Promise<void>;
    resetVerification: () => void;
}

export function useContentVerification(): UseContentVerificationReturn {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUploadComplete = async (res: { key: string; url: string; name: string }[]) => {
        if (res && res.length > 0) {
            setIsAnalyzing(true);
            setError(null); const contentId = res[0].key;
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
                    uploader: data.creatorsId.userId,
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
        setUploaderHierarchy(null);
        setError(null);
    };

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