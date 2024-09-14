import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronDown, ChevronUp, X, CameraIcon, Upload, Loader,CircleCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileVerificationProps {
  profileVerified: "yes" | "no" | "verifying" | string;
  openStep: number | null;
  toggleStep: (step: number) => void;
  handleAction: (action: number) => void;
  profileImages: string[];
  handleProfileUpload: () => void;
  setProfileVerified: (status: "yes" | "no" | "verifying") => void;
}

const ProfileVerification: React.FC<ProfileVerificationProps> = ({
  profileVerified,
  openStep,
  toggleStep,
  handleAction,
  profileImages,
  handleProfileUpload,
  setProfileVerified,
}) => {
  return (
    <div className="mb-2">
      <button
        className="w-full outline-none flex items-center justify-between text-left py-2"
        onClick={() => toggleStep(1)}
      >
        <div className="flex items-center space-x-2">
          {profileVerified === "yes" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <X className="w-5 h-5 text-red-500" />
          )}
          <span className={`text-sm ${profileVerified === "yes" ? 'text-green-500' : 'text-red-500'}`}>
            Profile Photo Upload
          </span>
        </div>
        {openStep === 1 ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {openStep === 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-2"
          >
            {profileVerified === "yes" && (
              <div className="flex w-full flex-col items-center justify-center">
                <CircleCheckIcon className="size-10 text-green-500" />
                <p className="text-sm mb-2 font-bold text-black dark:text-white w-full text-center">Profile Photo Verified</p>
                <p className="flex text-center w-full text-sm mb-2 text-black dark:text-white">Congratulations! Your profile photo has been successfully verified.</p>
                <Button
                  onClick={() => {
                    handleAction(1);
                    setProfileVerified("no");
                  }}
                  className="bg-purple-700 text-white"
                >
                  <CameraIcon className="mr-2 h-5 w-5" />
                  Recapture Photo
                </Button>
              </div>
            )}
            {profileVerified === "no" && (
              <>
                <p className="text-sm mb-2 text-gray-400">Upload a clear photo of yourself</p>
                <div className="w-full flex flex-col items-center justify-center">
                  {profileImages.length > 0 && (
                    <div className="flex items-center justify-center w-full max-w-md my-2">
                      <img
                        src={profileImages[0]}
                        width={250}
                        height={200}
                        alt="Profile"
                        className="aspect-video rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-row gap-4">
                    {profileImages.length > 0 && (
                      <Button onClick={handleProfileUpload} className="bg-blue-500 text-white hover:bg-blue-500">
                        <Upload className="mr-2 h-5 w-5" />
                        Upload
                      </Button>
                    )}
                    <Button onClick={() => handleAction(1)} className="bg-purple-700 text-white">
                      <CameraIcon className="mr-2 h-5 w-5" />
                      Capture Photo
                    </Button>
                  </div>
                </div>
              </>
            )}
            {profileVerified === "verifying" && (
              <div className="w-full flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-black dark:text-white">Verifying...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileVerification;
