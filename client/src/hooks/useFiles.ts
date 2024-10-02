import { useState, useEffect, useMemo } from 'react';
import { FileInfo } from '@/lib/types';
import { MonthlyData } from '@/lib/frontend-types';

export const useFiles = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeFile = (file: any): FileInfo => ({
    $collectionId: file.$collectionId,
    $createdAt: file.$createdAt,
    $databaseId: file.$databaseId,
    $id: file.$id,
    $permissions: file.$permissions || [],
    $updatedAt: file.$updatedAt,
    fileId: file.fileId,
    fileName: file.fileName || file.media_title,
    fileSize: file.fileSize,
    fileType: file.fileType || file.media_type,
    fileUrl: file.fileUrl,
    userId: file.userId,
    verified: Boolean(file.verified),
    tampered: Boolean(file.is_tampered || file.tampered || file.isManipulated),
    video_hash: file.video_hash,
    collective_audio_hash: file.collective_audio_hash,
    image_hash: file.image_hash,
    media_title: file.media_title,
    media_type: file.media_type,
    verificationDate: file.verificationDate,
    fact_check: file.fact_check,
    gan_generated: file.ganGenerated,
    face_manipulation: file.faceManipulation,
    audio_manipulation: file.audioDeepFake, // Fixed typo: audo_manipulation -> audio_manipulation
    image_manipulation: file.imageDeepFake
  });

  const processMonthlyData = (files: FileInfo[]): MonthlyData[] => {
    const currentYear = new Date().getFullYear();
    const monthlyDataMap = new Map<string, MonthlyData>();

    // Initialize data for all months of the current year
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' });
      monthlyDataMap.set(monthName, {
        month: monthName,
        verifiedCount: 0,
        unverifiedCount: 0,
        tamperedCount: 0
      });
    }

    // Process files
    files.forEach(file => {
      const fileDate = new Date(file.$createdAt || new Date());
      if (fileDate.getFullYear() === currentYear) {
        const monthName = fileDate.toLocaleString('default', { month: 'short' });
        const monthData = monthlyDataMap.get(monthName);
        if (monthData) {
          if (file.tampered) {
            monthData.tamperedCount++;
            monthData.verifiedCount++;
          } else if (file.verified) {
            monthData.verifiedCount++;
          } else {
            monthData.unverifiedCount++;
          }
        }
      }
    });

    // Convert map to array and sort by month
    return Array.from(monthlyDataMap.values()).sort((a, b) => 
      new Date(currentYear, "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(a.month) / 3, 1).getTime() - 
      new Date(currentYear, "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(b.month) / 3, 1).getTime()
    );
  };

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