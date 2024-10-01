import { AppwriteUser, FileInfo } from "./types";
import { AppwriteUser as UserType } from "@/lib/types";

export interface MonthlyData {
  month: string;
  verifiedCount: number;
  unverifiedCount: number;
  tamperedCount: number;
}
export interface CustomPlayerProps {
  url: string;
}
export type UploadedFileType = {
  key: string;
  url: string;
  name: string;
};
export interface LogEntry {
  event: string;
  user: string;
  deviceName: string;
  deviceBrand?: string;
  deviceModel?: string;
  osName: string;
  osVersion: string;
  timestamp: string;
}
export interface LogResult {
  success: boolean;
  logs?: LogEntry[];
  error?: string;
}
export interface RecentActivityProps {
  files: FileInfo[];
}
export interface ProfileInfoProps {
  user: UserType;
}
export interface MonthlyFileHistogramProps {
  files: FileInfo[];
}
export interface ContentTableProps {
  files: FileInfo[]
}
export interface ContentPaginationProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalItems: number
  itemsPerPage: number
}
export interface ContentInsightsProps {
  verifiedCount: number;
  tamperedCount: number;
  unverifiedCount: number;
}
export interface ContentFiltersProps {
  filterStatus: string
  setFilterStatus: (status: string) => void
  filterType: string
  setFilterType: (type: string) => void
  sortBy: 'Date' | 'Status' | 'Title'
  setSortBy: (sortBy: 'Date' | 'Status' | 'Title') => void
}

export interface CameraProviderProps {
  children: React.ReactNode;
}

export interface CameraContextType {
  numberOfCameras: number;
  activeDeviceId: string | undefined;
  images: string[];
  devices: MediaDeviceInfo[];
  playerRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  notSupported: boolean;
  permissionDenied: boolean;

  setNumberOfCameras: React.Dispatch<React.SetStateAction<number>>;
  setActiveDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDevices: React.Dispatch<React.SetStateAction<MediaDeviceInfo[]>>;
  addImage: (imageData: string) => void;
  removeImage: (index: number) => void;
  resetImages: () => void;
  initCameraStream: () => Promise<void>;
  takePhoto: () => string | undefined;
  stopStream: () => void;
  switchCamera: () => void;
}
export interface ErrorSectionProps {
  error: string;
}
export interface UploadSectionProps {
  onUploadComplete: (res: { key: string; url: string; name: string }[]) => void;
  onUploadError: (error: string) => void;
}
export interface EmailVerificationProps {
  emailVerified: "yes" | "no" | "send" | string;
  openStep: number | null;
  toggleStep: (step: number) => void;
  handleAction: (action: number) => void;
}
export interface GovIdUploadProps {
  idVerified: 'yes' | 'no' | 'uploading' | string;
  idImages: string[];
  openStep: number | null;
  toggleStep: (step: number) => void;
  handleAction: (action: number) => void;
  handleIdUpload: () => void;
  setIdVerified: (status: 'yes' | 'no' | 'uploading') => void;
}

export interface ProfileVerificationProps {
  profileVerified: "yes" | "no" | "verifying" | string;
  openStep: number | null;
  toggleStep: (step: number) => void;
  handleAction: (action: number) => void;
  profileImages: string[];
  handleProfileUpload: () => void;
  setProfileVerified: (status: "yes" | "no" | "verifying") => void;
}
export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}
export 
interface TrustScoreTrendProps {
  monthlyData: Array<{
    month: string;
    verifiedCount: number;
    unverifiedCount: number;
    tamperedCount: number;
  }>;
}

export interface UserHeaderProps {
  user: AppwriteUser | null
}
export interface UserProfileProps {
  user: AppwriteUser | null;
  userProfileImage: string;
  isVerified: boolean;
}
export interface VerifiedVideosProps {
  files: FileInfo[]; // Pass the files data as a prop
}
export interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
export interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}
export interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
}
export interface User {
  userId: string;
  name: string;
  uploadTimestamp: number;
  children: User[];
}
export type VerificationStatus = 'pending' | 'completed' | 'error';

export interface VerificationResult {
  video_hash?: string;
  collective_audio_hash?: string;
  image_hash?: string;
  audio_hash?: string;
  frame_hash?: string;
}

export type UserStats = {
  totalVerifiedVideos: number;
  contentCredibilityScore: number;
  attributionsEarned: number;
  communityTrustLevel: string;
  videosFlagged: number;
  successfulVerifications: number;
  disputedClaims: number;
  appealsResolved: number;
};

export type UserData = {
  name: string;
  isVerified: boolean;
  credibilityScore: number;
  profilePicture: string;
  stats: UserStats;
};
