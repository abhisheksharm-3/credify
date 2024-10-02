import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, X } from "lucide-react"
import { checkVerify, getLoggedInUser, sendVerificationEmail, setIdPhoto, setProfilePhoto } from '@/lib/server/appwrite'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Camera from "@/components/ui/camera/camera";
import UserInfo from './UserInfo'
import EmailVerification from './EmailVerification'
import ProfilePhotoUpload from './ProfilePhotoUpload'
import GovIdUpload from './GovIdUpload'
import { toast } from 'sonner'
import { UserHeaderProps } from '@/lib/frontend-types'
import { uploadPhoto } from '@/lib/firebaseUpload'

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [emailVerified, setEmailVerified] = useState("no");
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [idImages, setIdImages] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [profileVerified, setProfileVerified] = useState("no");
  const [idVerified, setIdVerified] = useState("no");
  const [userId, setUserId] = useState("");
  const [userProfileImage, setUserProfileImage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getLoggedInUser();
        if (userData) {
          setUserId(userData?.$id);
          if (userData?.prefs.profilePhoto) {
            setUserProfileImage(userData.prefs.profilePhoto);
            setProfileVerified("yes");
          }
          if (userData?.prefs.IdPhoto) {
            setIdVerified("yes");
          }
        }
        setIsVerified(userData?.labels.includes('verified') || false);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (profileVerified === "yes" && emailVerified === "yes" && idVerified === "yes") {
      setIsVerified(true);
    }
  }, [isVerified, profileVerified, emailVerified, idVerified])

  useEffect(() => {
    const checkVerification = async () => {
      const response = await checkVerify();
      if (response.success && response.verified) {
        setEmailVerified("yes");
      } else if (response.success && !response.verified) {
      } else {
        console.error(response.error);
      }
    };
    checkVerification();
  }, []);
  const sendVerify = async () => {
    try {
      const result = await sendVerificationEmail();
      if (result.success) {
        toast.success("Verification email sent! Check your inbox.");
        setEmailVerified("send");
      } else {
        toast.error("Failed to send verification email.");
        setEmailVerified("no");
      }
    } catch (error) {
      toast.error("Failed to send verification email.");
      setEmailVerified("no");
    }
  };
  const toggleStep = (index: number) => {
    setOpenStep(openStep === index ? null : index);
  };
  const handleCapturePhoto = async (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setShowDialog(true);
  };
  const handleCapturedImages = (images: string[]) => {
    if (currentStepIndex === 1) {
      setProfileImages(images);
    } else if (currentStepIndex === 2) {
      setIdImages(images);
    }
    setShowDialog(false);
  };
  const handleAction = (stepIndex: number) => {
    if (stepIndex === 0) {
      sendVerify();
    } else {
      handleCapturePhoto(stepIndex);
    }
  };
  const handleProfileUpload = async () => {
    for (const imageUrl of profileImages) {
      try {
        const downloadURL = await uploadPhoto(imageUrl, "profile");
        verifyProfileImage(downloadURL);
      } catch (error) {
        toast.error("Error uploading profile photo");
      }
    }
  };
  const verifyProfileImage = async (url: string) => {
    try {
      setProfileVerified("verifying");
      const response = await fetch(`/api/auth/verify-liveliness?url=${encodeURIComponent(url)}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const isReal = data.result?.is_real;
      if (isReal) {
        setProfileVerified("yes");
        sendProfileUrl(url);
        toast.success("Profile Photo Verified");
      } else {
        setProfileVerified("no");
        setProfileImages([]);
        toast.error("Profile Photo not Verified. Try again.")
      }
    } catch (error) {
      toast.error('Error during fetch');
    }
  };
  const sendProfileUrl = async (url: string) => {
    const profileURL = url;
    const response = await setProfilePhoto(userId, profileURL);
    if (response.success) {
      toast.success(response.message);
      return response;
    } else {
      toast.error(response.error);
      return response;
    }
  }
  const sendIdUrl = async (url: string) => {
    const IdUrl = url;
    const response = await setIdPhoto(userId, IdUrl);
    if (response.success) {
      setIdVerified("yes");
      toast.success("Gov ID uploaded");
      return response;
    } else {
      toast.error(response.error);
      return response;
    }
  }
  const handleIdUpload = async () => {
    setIdVerified("uploading");
    for (const imageUrl of idImages) {
      try {
        const downloadURL = await uploadPhoto(imageUrl, "id");
        sendIdUrl(downloadURL);
      } catch (error) {
        toast.error("Error uploading gov id photo");
      }
    }
  };
  return (
    <header className="relative bg-gradient-to-tl from-white via-purple-300 via-purple-500 to-purple-700  dark:bg-gradient-to-r dark:from-black/50 dark:to-purple-600/30 backdrop-blur-lg shadow-lg"  >
      <div className="container pt-12 lg:py-12 pb-4">
        <UserInfo isVerified={isVerified} user={user} userProfileImage={userProfileImage} />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="mt-4 ml-0">
          {!isVerified && (
            <div className="container mx-auto pt-2 pl-2 lg:pl-8 xl:pl-0">
              <div className="flex flex-wrap flex-row justify-start  items-start gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} className="flex  items-center bg-white/60 dark:bg-white/10 backdrop-blur-lg rounded-full ml-2 px-3 lg:px-4 py-3 shadow-lg cursor-pointer">
                      {isVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-red-500  mr-2" />
                      )}
                      <span className="text-xs lg:text-s font-medium dark:text-white">
                        {isVerified ? "Verified Creator" : "Unverified Creator"}
                      </span>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[375px] bg-card text-white">
                    <DialogHeader className='flex justify-between flex-row'>
                      <DialogTitle className="text-xl font-bold text-black dark:text-white">Creator Verification Process</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <EmailVerification emailVerified={emailVerified} openStep={openStep} toggleStep={toggleStep} handleAction={handleAction} />
                      <ProfilePhotoUpload profileVerified={profileVerified} openStep={openStep} toggleStep={toggleStep} handleAction={handleAction} profileImages={profileImages} handleProfileUpload={handleProfileUpload} setProfileVerified={setProfileVerified} />
                      <GovIdUpload idVerified={idVerified} idImages={idImages} openStep={openStep} toggleStep={toggleStep} handleAction={handleAction} handleIdUpload={handleIdUpload} setIdVerified={setIdVerified} />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
                  <DialogContent className="h-svh w-svw max-w-full p-0">
                    <Camera onClosed={() => setShowDialog(false)} onCapturedImages={handleCapturedImages} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </motion.div >
      </div>
    </header >
  )
}
export default UserHeader