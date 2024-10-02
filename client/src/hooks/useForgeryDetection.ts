import { ForgeryDetectionResult } from '@/lib/types';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useForgeryDetection(contentId: string) {
  const [forgeryResult, setForgeryResult] = useState<ForgeryDetectionResult | null>(null);
  const fetchForgeryData = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/content/detect-forgery/${contentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data: ForgeryDetectionResult = await response.json();
      console.log("Forgery detection data:", data);
      setForgeryResult(data);

      return data.status === 'completed';
    } catch (error) {
      console.error('Error fetching forgery data:', error);
      toast.error("Error in forgery detection");
      return true; // Error occurred
    }
  }, [contentId]);

  return { forgeryResult, fetchForgeryData };
}