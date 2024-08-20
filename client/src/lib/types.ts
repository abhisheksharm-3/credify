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