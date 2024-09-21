import { useState, useEffect } from 'react';
import { FileInfo } from '@/lib/types';

export const useFiles = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [tamperedCount, setTamperedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [files]);

  return { files, setFiles, verifiedCount, unverifiedCount, tamperedCount, totalCount };
};
