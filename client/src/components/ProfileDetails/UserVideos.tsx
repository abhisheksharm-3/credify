import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, XCircle, TriangleAlert } from 'lucide-react';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { FileInfo } from '@/lib/types';

// Define the props for the VerifiedVideos component
interface VerifiedVideosProps {
  files: FileInfo[]; // Pass the files data as a prop
}

const VerifiedVideos: FC<VerifiedVideosProps> = ({ files }) => {
  const [videoStates, setVideoStates] = useState<FileInfo[]>([]);
  const navigate = useRouter(); // Initialize useNavigate

  useEffect(() => {
    // Set only the top 6 files
    setVideoStates(files.slice(0, 6));
  }, [files]);

  const getStatusMessage = (file: FileInfo) => {
    if (file.verified) {
      return {
        icon: <CircleCheck className="w-4 h-4 text-green-600" />,
        text: "Verified",
        buttonText: "Verification Link"
      };
    }
    if (file.tampered) {
      return {
        icon: <TriangleAlert className="w-4 h-4 text-red-600" />,
        text: "Tampered",
        buttonText: "Verification Link"
      };
    }
    return {
      icon: <XCircle className="w-4 h-4 text-gray-600" />,
      text: "Not Verified",
      buttonText: "Verify"
    };
  };

  const handleVerificationRedirect = (file: FileInfo) => {
    let redirectUrl;
    if (!file.verified) {
      redirectUrl = `/content/${file.fileId}`;
    } else if (file.fileType === 'image') {
      redirectUrl = `/verify/${file.image_hash}`;
    } else {
      redirectUrl = `/verify/${file.video_hash}`;
    }
    window.location.href = redirectUrl;
  };

  const handleClick = (file: FileInfo) => {
    handleVerificationRedirect(file);
  };

  // Utility to truncate the filename
  const truncateFileName = (fileName: string, maxLength: number = 20) => {
    return fileName.length > maxLength ? `${fileName.slice(0, maxLength)}...` : fileName;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="mt-24"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">All Content</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {videoStates.map((file, index) => {
          const { icon, text, buttonText } = getStatusMessage(file); // Get status message, icon, and button text

          return (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="bg-card text-card-foreground border-2 border-gray-600 rounded-xl p-3 pl-5">
                <div>
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-row items-center gap-4 justify-start">
                      <div className="bg-card-foreground/20 rounded-full p-2 shadow-lg">
                        {file.fileType === 'image' ? (
                          <ImageIcon className="w-12 h-12 text-card-foreground" />
                        ) : (
                          <VideoIcon className="w-12 h-12 text-card-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {truncateFileName(file.fileName || file.media_title || "")} {/* Truncate filename */}
                        </h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
                          {/* Status */}
                          <div className="flex items-center gap-2">
                            {icon}
                            <span>{text}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-end justify-end">
                      <button
                        className='bg-primary hover:bg-purple-900 text-white py-2 text-center px-3 rounded text-sm flex flex-row items-center gap-2 justify-center'
                        onClick={() => handleClick(file)} // Handle button click
                      >
                        {buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );

};

export default VerifiedVideos;

// Video icon component
const VideoIcon: FC<{ className?: string; width?: number; height?: number }> = ({ className, width = 24, height = 24 }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

// Image icon component
const ImageIcon: FC<{ className?: string; width?: number; height?: number }> = ({ className, width = 24, height = 24 }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
