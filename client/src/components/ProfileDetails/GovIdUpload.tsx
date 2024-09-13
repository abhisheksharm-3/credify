// components/GovIdUpload.tsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X, ChevronUp, ChevronDown, CircleCheckIcon, CameraIcon, Upload, Loader } from 'lucide-react'; 

interface GovIdUploadProps {
  idVerified: 'yes' | 'no' | 'uploading' | string;
  idImages: string[];
  openStep: number | null;
  toggleStep: (step: number) => void;
  handleAction: (action: number) => void;
  handleIdUpload: () => void;
  setIdVerified: (status: 'yes' | 'no' | 'uploading') => void;
}

const GovIdUpload: React.FC<GovIdUploadProps> = ({
  idVerified,
  idImages,
  openStep,
  toggleStep,
  handleAction,
  handleIdUpload,
  setIdVerified,
}) => {
  return (
    <div className="mb-2">
      <button
        className="w-full outline-none flex items-center justify-between text-left py-2"
        onClick={() => toggleStep(2)}
      >
        <div className="flex items-center space-x-2">
          {idVerified === "yes" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <X className="w-5 h-5 text-red-500" />
          )}
          <span className={`text-sm ${idVerified === "yes" ? 'text-green-500' : 'text-red-500'}`}>
            Government ID Upload
          </span>
        </div>
        {openStep === 2 ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {openStep === 2 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-2"
          >
            {idVerified === "yes" && (
              <div className="flex w-full flex-col items-center justify-center">
                <CircleCheckIcon className="size-10 text-green-500" />
                <p className="text-sm mb-2 font-bold text-black dark:text-white w-full text-center">Government ID Uploaded</p>
                <p className="flex text-center w-full text-sm mb-2 text-black dark:text-white">Your government ID has been successfully uploaded.</p>
                <button
                  onClick={() => {
                    handleAction(1);
                    setIdVerified("no");
                  }}
                  className="bg-purple-700 text-white flex items-center px-4 py-2 rounded"
                >
                  <CameraIcon className="mr-2 h-5 w-5" />
                  Recapture Photo
                </button>
              </div>
            )}
            {idVerified === "no" && (
              <>
                <p className="text-sm mb-2 text-gray-400">Upload a photo of your government-issued ID</p>
                <div className="w-full flex flex-col items-center justify-center">
                  {idImages.length > 0 && (
                    <div className="flex items-center justify-center w-full max-w-md my-2">
                      <img
                        src={idImages[0]}
                        width={250}
                        height={200}
                        alt="Government ID"
                        className="aspect-video rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-row gap-4">
                    {idImages.length > 0 && (
                      <button
                        onClick={handleIdUpload}
                        className="bg-blue-500 text-white hover:bg-blue-600 flex items-center px-4 py-2 rounded"
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Upload
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(2)}
                      className="bg-purple-700 text-white flex items-center px-4 py-2 rounded"
                    >
                      <CameraIcon className="mr-2 h-5 w-5" />
                      Capture Photo
                    </button>
                  </div>
                </div>
              </>
            )}
            {idVerified === "uploading" && (
              <div className="w-full flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-black dark:text-white">Uploading...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GovIdUpload;
