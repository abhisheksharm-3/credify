import { useState, useEffect, useMemo } from 'react';
import { FileInfo } from '@/lib/types';
import { normalizeFile, processMonthlyData } from '@/lib/frontend-function';

export const useFiles = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/content/get');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const normalizedFiles = data.files.map(normalizeFile);
        setFiles(normalizedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to fetch files. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const { verifiedCount, unverifiedCount, tamperedCount, totalCount, monthlyData } = useMemo(() => {
    const verified = files.filter(file => file.verified).length;
    const tampered = files.filter(file => file.tampered).length;
    const unverified = files.filter(file => !file.verified && !file.tampered).length;
    const total = verified + unverified;
    const monthly = processMonthlyData(files);

    return {
      verifiedCount: verified,
      unverifiedCount: unverified,
      tamperedCount: tampered,
      totalCount: total,
      monthlyData: monthly
    };
  }, [files]);

  return { 
    files, 
    setFiles, 
    verifiedCount, 
    unverifiedCount, 
    tamperedCount, 
    totalCount, 
    monthlyData,
    isLoading,
    error
  };
};