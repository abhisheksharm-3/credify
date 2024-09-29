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
    $collectionId?: string;
    $createdAt?: string;
    $databaseId?: string;
    $id: string;
    $permissions?: any[];
    $updatedAt?: string;
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: 'image' | 'video'; 
    fileUrl?: string;
    userId?: string;
    verified?: boolean;
    tampered?: boolean; // Optional field
  
    video_hash?: string;
    collective_audio_hash?: string;
    image_hash?: string;
    is_tampered?: boolean;
    is_deepfake?: boolean;
    media_title?: string;
    media_type?: string;
    verificationDate?: string; 
    fact_check?: string;
    geminiAnalysis?: string;
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

  export interface Content {
    id: number
    title: string
    type: 'video' | 'image'
    uploadDate: string
    status: 'Published' | 'Draft' | 'Under Review'
    creator: string
    duration?: string
    dimensions?: string
    description: string
  }

/*   export interface FileInfo {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: any[];
    $updatedAt: string;
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: 'image' | 'video'; 
    fileUrl: string;
    userId: string;
    verified: boolean;
    tampered?: boolean; // Optional field
    
  } */
  
  export interface FileInfo {
    $collectionId?: string;
    $createdAt?: string;
    $databaseId?: string;
    $id: string;
    $permissions?: any[];
    $updatedAt?: string;
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: 'image' | 'video'; 
    fileUrl?: string;
    userId?: string;
    verified?: boolean;
    tampered?: boolean; // Optional field
  
    video_hash?: string;
    collective_audio_hash?: string;
    image_hash?: string;
    is_tampered?: boolean;
    is_deepfake?: boolean;
    media_title?: string;
    media_type?: string;
    verificationDate?: string; 
    fact_check?: string;
  }

  export interface DownloadResult {
    buffer: Buffer;
    contentType: string;
  }
  
  export interface ForgeryDetectionResult {
    status: 'pending' | 'completed' | 'error';
    contentType?: 'image' | 'video' | 'unknown';
    isManipulated?: boolean;
    manipulationProbability?: number;
    detectionMethods?: {
      imageManipulation?: boolean;
      ganGenerated?: boolean;
      faceManipulation?: boolean;
      audioDeepfake?: boolean;
    };
    message?: string;
  }
  export interface VerifyLivenessResponseType {
    result?: any;
    error?: string;
}
