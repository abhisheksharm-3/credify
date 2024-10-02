import { MonthlyData } from "./frontend-types";
import { FileInfo } from "./types";

export const truncateFileName = (name: string, maxLength: number): string => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 3) + '...';
};

export const handleVerificationRedirect = (file: FileInfo): void => {
    let redirectUrl: string;
    if (!file.verified) {
        redirectUrl = `/content/${file.fileId}`;
    } else if (file.video_hash) {
        redirectUrl = `/verify/${file.video_hash}`;
    } else {
        redirectUrl = `/verify/${file.image_hash}`;
    }
    window.location.href = redirectUrl;
};

export const handleNavigation = (id: string) => {
    let redirectUrl: string;
    redirectUrl = `/verify/creator/${id}`;
    window.location.href = redirectUrl;
  };
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad with leading zero
    const year = date.getFullYear(); // Get full year

    return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

export const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) return '0 Byte';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};
export const getStatusText = (file: FileInfo) => {
    if (file.tampered) {
        return 'Tampered';
    }
    return file.verified ? 'Verified' : 'Unverified';
}

export function normalizeFile(file: any): FileInfo {
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
    audio_manipulation: file.audioDeepFake,
    image_manipulation: file.imageDeepFake
  };
}

// Process files into monthly data
export function processMonthlyData(files: FileInfo[]): MonthlyData[] {
  const currentYear = new Date().getFullYear();
  const monthlyDataMap: { [key: string]: MonthlyData } = {};

  // Initialize data for all months of the current year
  for (let month = 0; month < 12; month++) {
    const monthName = new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' });
    monthlyDataMap[monthName] = {
      month: monthName,
      verifiedCount: 0,
      unverifiedCount: 0,
      tamperedCount: 0,
    };
  }

  // Process files
  files.forEach(file => {
    const fileDate = new Date(file.$createdAt || '');
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
