import { useState, useEffect } from 'react';
import { FileInfo } from '@/lib/types';

interface MonthlyData {
  month: string;
  verifiedCount: number;
  unverifiedCount: number;
  tamperedCount: number;
}

export const useFiles = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [tamperedCount, setTamperedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  function normalizeFile(file: any): FileInfo {
    return {
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
      verified: file.verified,
      tampered: file.is_tampered || file.tampered,
      video_hash: file.video_hash,
      collective_audio_hash: file.collective_audio_hash,
      image_hash: file.image_hash,
      is_tampered: file.is_tampered,
      is_deepfake: file.is_deepfake,
      media_title: file.media_title,
      media_type: file.media_type,
      verificationDate: file.verificationDate,
      fact_check: file.fact_check,
    };
  }

  function processMonthlyData(files: FileInfo[]): MonthlyData[] {
    const currentYear = new Date().getFullYear();
    const monthlyDataMap: { [key: string]: MonthlyData } = {};

    // Initialize data for all months of the current year
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' });
      monthlyDataMap[monthName] = {
        month: monthName,
        verifiedCount: 0,
        unverifiedCount: 0,
        tamperedCount: 0
      };
    }

    // Process files
    files.forEach(file => {
      const fileDate = new Date(file.$createdAt || "");
      if (fileDate.getFullYear() === currentYear) {
        const monthName = fileDate.toLocaleString('default', { month: 'short' });
        if (file.verified) {
          monthlyDataMap[monthName].verifiedCount++;
        } else if (file.tampered) {
          monthlyDataMap[monthName].tamperedCount++;
        } else {
          monthlyDataMap[monthName].unverifiedCount++;
        }
      }
    });

    // Convert map to array and sort by month
    return Object.values(monthlyDataMap).sort((a, b) => 
      new Date(currentYear, "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(a.month) / 3, 1).getTime() - 
      new Date(currentYear, "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(b.month) / 3, 1).getTime()
    );
  }

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/content/get');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const normalizedFiles = data.files.map(normalizeFile);
        setFiles(normalizedFiles);
        const verified = normalizedFiles.filter((file: { verified: any }) => file.verified).length;
        const tampered = normalizedFiles.filter((file: { tampered: any }) => file.tampered).length;
        const unverified = normalizedFiles.filter((file: { verified: any; tampered: any }) => !file.verified && !file.tampered).length;
        setVerifiedCount(verified);
        setTamperedCount(tampered);
        setUnverifiedCount(unverified);
        setTotalCount(verified + tampered + unverified);
        
        // Process and set monthly data
        const monthlyData = processMonthlyData(normalizedFiles);
        setMonthlyData(monthlyData);
        console.log(monthlyData);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  return { files, setFiles, verifiedCount, unverifiedCount, tamperedCount, totalCount, monthlyData };
};