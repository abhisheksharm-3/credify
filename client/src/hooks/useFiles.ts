import { useState, useEffect, useMemo } from 'react';
import { FileInfo } from '@/lib/types';
import { MonthlyData } from '@/lib/frontend-types';
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

        const verified = normalizedFiles.filter((file: { verified: any; }) => file.verified).length;
        const tampered = normalizedFiles.filter((file: { tampered: any; }) => file.tampered).length;
        const unverified = normalizedFiles.filter((file: { verified: any; tampered: any; }) => !file.verified && !file.tampered).length;

        setVerifiedCount(verified);
        setTamperedCount(tampered);
        setUnverifiedCount(unverified);
        setTotalCount(verified + tampered + unverified);

        // Process and set monthly data
        const monthlyData = processMonthlyData(normalizedFiles);
        setMonthlyData(monthlyData);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to fetch files. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);
  return { files, verifiedCount, unverifiedCount, tamperedCount, totalCount, monthlyData };
};
