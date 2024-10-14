import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, XCircle, TriangleAlert, Image, Video } from 'lucide-react';
import { FC } from 'react';
import { FileInfo } from '@/lib/types';
import { VerifiedVideosProps } from '@/lib/frontend-types';
import { handleVerificationRedirect, truncateFileName } from '@/lib/frontend-function';

const VerifiedVideos: FC<VerifiedVideosProps> = ({ files }) => {
  const [videoStates, setVideoStates] = useState<FileInfo[]>([]);

  useEffect(() => {
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
          const { icon, text, buttonText } = getStatusMessage(file); 

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
                          <Image className="w-12 h-12 text-card-foreground" />
                        ) : (
                          <Video className="w-12 h-12 text-card-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {truncateFileName(file.fileName || file.media_title || "",20)} 
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
                        onClick={() => handleVerificationRedirect(file)} // Handle button click
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

