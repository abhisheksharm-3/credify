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
    redirectUrl = `/creator/${id}`;
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
