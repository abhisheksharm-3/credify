import { FileInfo } from "./types";

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