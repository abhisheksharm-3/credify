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

  export interface VerificationResultType {
    verified: boolean;
    status: string;
    message: string;
    uploader?: string;
    timestamp?: string;
    video_hash?: string;
    collective_audio_hash?: string;
    image_hash?: string;
    audio_hash?: string;
    frame_hash?: string;
  }
  
  export interface User {
    userId: string;
    name: string;
    dateOfUpload: string;
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
  

  export interface VerifyLivenessResponseType {
    result?: any;
    error?: string;
}
export interface DownloadResultType {
  buffer: Buffer;
  contentType: string;
}

export interface ApiResponseType {
  message: string;
  result: {
    frame_hashes: string[];
    audio_hashes: string[];
    image_hash: string | null;
    video_hash: string;
  }
}

export interface AnalysisStatus {
  status: 'pending' | 'found' | 'not_found' | 'error';
  verified?: boolean;
  contentHash?: string;
  verificationResult?: VerificationResultType;
  creatorsId?: string;
  message?: string;
}

export interface ContentInfo {
  contentUrl: string;
  contentType: string;
  filename: string;
  endpoint: string;
}


export interface VerificationStatus {
  status: 'pending' | 'completed' | 'error';
  result?: VerificationResultType;
  geminiAnalysis?: string;
  message?: string;
  existing?: boolean;
}

// Database related types
export interface VerifiedContent {
  video_hash: string | null;
  collective_audio_hash: string | null;
  image_hash: string | null;
  userId: string;
  media_title: string;
  media_type: string;
  contentId: string;
  verificationDate: string;
  fact_check: string;
}

// Neo4j related types
export interface Neo4jVerificationResult {
  verificationResult: VerificationResultType | null;
  userExists: boolean;
}

// Appwrite related types
export interface AppwriteUser {
  $id: string;
  // Add other user properties as needed
}

// Error types
export interface ApiError {
  error: string;
  details?: string;
}

export  interface UseContentVerificationReturn {
  isAnalyzing: boolean;
  verificationComplete: boolean;
  verificationResult: VerificationResultType | null;
  uploaderHierarchy: User | null;
  error: string | null;
  handleUploadComplete: (res: { key: string; url: string; name: string }[]) => Promise<void>;
  resetVerification: () => void;
}

export interface VerificationResultSectionProps {
  verificationResult: VerificationResultType;
  uploaderHierarchy: User | null;
  onResetVerification: () => void;
  forgeryResult: ForgeryDetectionResult | null; // Updated this line
}

export interface ForgeryDetectionResult {
  status?: 'pending' | 'completed' | 'error';
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

export interface ForgeryAnalysisTabProps {
  forgeryResult: ForgeryDetectionResult | null;
}
