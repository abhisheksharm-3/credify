export interface VideoData {
    title: string;
    uploadDate: string;
    status: 'Verified' | 'Pending' | 'Tampered';
  }
  
  export interface ChartDataPoint {
    month: string;
    desktop: number;
  }
  
  export interface CardData {
    title: string;
    description: string;
    value: number;
  }
  export interface AppwriteUser {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    email: string;
    phone: string;
    emailVerification: boolean;
    phoneVerification: boolean;
    status: boolean;
    labels: string[];
    prefs: Record<string, any>;
    accessedAt: string;
    registration: string;
  }
  export type UploadedFileType = {
    id: string;
    customId: string | null;
    key: string;
    name: string;
    status: "Deletion Pending" | "Failed" | "Uploaded" | "Uploading";
  };

  export interface FileType {
    userId: string;
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    $id: string;
    $createdAt: string;
    $updatedAt: string;
  }

  export interface VerificationResult {
    verified: boolean;
    status: string;
    message: string;
    uploader?: string;
    timestamp?: string;
    isTampered: boolean;
  }
  
  export interface User {
    userId: string;
    name: string;
    uploadTimestamp: number;
    children: User[];
  }