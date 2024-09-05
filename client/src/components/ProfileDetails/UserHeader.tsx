import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, ChevronDown, ChevronUp, Camera as CameraIcon, Upload, CircleCheckIcon } from "lucide-react"
import { User } from '@/lib/types'
import { getLoggedInUser } from '@/lib/server/appwrite'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User as UserIcon } from 'lucide-react';
import { FC } from "react"
import { RiVerifiedBadgeFill, RiStarFill } from '@remixicon/react'
import Camera from "@/components/ui/camera/camera";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../../src/lib/FirebaseConfig";

interface UserHeaderProps {
  user: User | null
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profilePhotoUploaded, setProfilePhotoUploaded] = useState(false);
  const [govIdUploaded, setGovIdUploaded] = useState(false);
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [idImages, setIdImages] = useState<string[]>([]);
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [idUrl, setIdUrl] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [profileverified, setprofileverified] = useState(false);
  const [idVerified, setidVerified] = useState(false);

  const storage = getStorage(app);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getLoggedInUser();
        setIsVerified(userData?.labels.includes('verified') || false);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  const toggleStep = (index: number) => {
    setOpenStep(openStep === index ? null : index);
  };

  const uploadPhoto = async (imageUrl: string, photoType: 'profile' | 'id') => {
    const fileName = `${photoType}-photo-${Date.now()}.jpg`;
    const metadata = { contentType: 'image/jpeg' };
    const storageRef = ref(storage, `Credify/${fileName}`);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
         },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error converting image URL to blob:', error);
      throw error;
    }
  };

  const handleCapturePhoto = async (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setShowDialog(true);
  };

  const handleCapturedImages = (images: string[]) => {
    if (currentStepIndex === 1) {
      setProfileImages(images);
      setProfilePhotoUploaded(true);
    } else if (currentStepIndex === 2) {
      setIdImages(images);
      setGovIdUploaded(true);
    }
    setShowDialog(false);
  };

  const handleAction = async (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        setEmailVerified(true);
        break;
      case 1:
      case 2:
        await handleCapturePhoto(stepIndex);
        break;
    }
  };
  const handleProfileUpload = async () => {
    for (const imageUrl of profileImages) {
      try {
        const downloadURL = await uploadPhoto(imageUrl, "profile");
        setProfileUrl(downloadURL);
        verifyProfileUpload();
      } catch (error) {
        console.error("Error uploading profile photo:", error);
      }
    }
  };

  const handleIdUpload = async () => {
    for (const imageUrl of idImages) {
      try {
        const downloadURL = await uploadPhoto(imageUrl, "id");
        setIdUrl(downloadURL);
        verifyIdUpload();
      } catch (error) {
        console.error("Error uploading gov id photo:", error);
      }
    }
  };

  const verifyIdUpload = async () => {
    setidVerified(true);
  };
  const verifyProfileUpload = async () => {
    setprofileverified(true);
  };

  return (
    <header className="relative bg-gradient-to-b from-purple-600 to-white dark:bg-gradient-to-r dark:from-black/50 dark:to-purple-600/30 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto px-4 ml-4 md:ml-6 lg:ml-8 pt-12 lg:py-12 pb-4">
        <div className="flex flex-row items-center justify-between">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-row items-center md:space-x-8 mb-6 md:mb-0"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="w-25 h-25 rounded-full overflow-hidden shadow-lg bg-white/5 border-3 border-black dark:border-white backdrop-blur-lg flex items-center justify-center p-1"
              >
                <UserIcon size={100} strokeWidth={1} />
              </motion.div>
            </div>
            <div className="text-start md:text-left  ml-4 ">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl md:text-2xl lg:text-3xl font-bold dark:text-white "
              >
                {user?.name || ""}
              </motion.h1>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-start flex-col "
              >
                <div className="flex  flex-row items-center gap-2 text-sm md:text-base lg:text-lg dark:text-white mt-2">
                  <RiStarFill className='text-yellow-500' size={20} />
                  <span>Trust Score: 4.8</span>
                </div>
                <div className="flex  flex-row items-center gap-2 text-sm md:text-base lg:text-lg dark:text-white mt-2">
                  <RiVerifiedBadgeFill className='text-blue-600 ' size={20} />
                  <span>Verified Videos: 124</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="p-2 pt-0"
      >
        <div className="container mx-auto p-2 pl-6 lg:pl-8">
          <div className="flex flex-wrap flex-row justify-start gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-white/40 dark:bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 lg:px-4 py-3 shadow-lg cursor-pointer"
                >
                  {isVerified ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
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
                  {/* Email Verification Step */}
                  <div className="mb-2">
                    <button
                      className="w-full outline-none flex items-center justify-between text-left py-2"
                      onClick={() => toggleStep(0)}
                    >
                      <div className="flex items-center space-x-2">
                        {emailVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm ${emailVerified ? 'text-green-500' : 'text-red-500'}`}>
                          Email Verification
                        </span>
                      </div>
                      {openStep === 0 ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </button>
                    <AnimatePresence>
                      {openStep === 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-2"
                        >
                          {emailVerified ? (
                            <div className="flex flex-col w-full flex-col items-center justify-center">
                              <CircleCheckIcon className="size-10 text-green-500" />
                              <p className="text-sm mb-2 font-bold text-black dark:text-white  w-full text-center">Email Verified</p>
                              <p className="flex text-center w-full text-sm mb-2 text-black dark:text-white ">Congratulations! Your email has been successfully verified.</p>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm mb-2 text-gray-400">Verify your email address</p>
                              <Button onClick={() => handleAction(0)} className="w-full bg-blue-500 text-white">
                                Send Verification Email
                              </Button>
                            </>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Profile Photo Upload Step */}
                  <div className="mb-2">
                    <button
                      className="w-full outline-none flex items-center justify-between text-left py-2"
                      onClick={() => toggleStep(1)}
                    >
                      <div className="flex items-center space-x-2">
                        {profileverified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm ${profileverified ? 'text-green-500' : 'text-red-500'}`}>
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
                          {profileverified ? (
                            <div className="flex flex-col w-full flex-col items-center justify-center">
                              <CircleCheckIcon className="size-10 text-green-500" />
                              <p className="text-sm mb-2 font-bold text-black dark:text-white w-full text-center">Profile Photo Verified</p>
                              <p className="flex text-center w-full text-sm mb-2 text-black dark:text-white">Congratulations! Your email has been successfully verified.</p>
                              <Button onClick={() => {
                                handleAction(1);
                                setprofileverified(false);
                              }} className="bg-purple-700 text-white">
                                <CameraIcon className="mr-2 h-5 w-5" />
                                Recapture Photo
                              </Button>
                            </div>

                          ) : (
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
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Government ID Upload Step */}
                  <div className="mb-2">
                    <button
                      className="w-full outline-none flex items-center justify-between text-left py-2"
                      onClick={() => toggleStep(2)}
                    >
                      <div className="flex items-center space-x-2">
                        {idVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm ${idVerified ? 'text-green-500' : 'text-red-500'}`}>
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
                          {idVerified ? (
                            <div className="flex flex-col w-full flex-col items-center justify-center">
                              <CircleCheckIcon className="size-10 text-green-500" />
                              <p className="text-sm mb-2 font-bold text-black dark:text-white w-full text-center">Government ID Verified</p>
                              <p className="flex text-center w-full text-sm mb-2 text-black dark:text-white">Your government ID has been successfully verified.</p>
                              <Button onClick={() => {
                                handleAction(1);
                                setidVerified(false);
                              }
                              } className="bg-purple-700 text-white">
                                <CameraIcon className="mr-2 h-5 w-5" />
                                Recapture Photo
                              </Button>
                            </div>
                          ) : (
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
                                    <Button onClick={handleIdUpload} className="bg-blue-500 text-white hover:bg-blue-500">
                                      <Upload className="mr-2 h-5 w-5" />
                                      Upload
                                    </Button>
                                  )}
                                  <Button onClick={() => handleAction(2)} className="bg-purple-700 text-white">
                                    <CameraIcon className="mr-2 h-5 w-5" />
                                    Capture Photo
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
              <DialogContent className="h-svh w-svw max-w-full p-0">
                <Camera
                  onClosed={() => setShowDialog(false)}
                  onCapturedImages={handleCapturedImages}
                />
              </DialogContent>
            </Dialog>

            {["Trusted Content Producer", "Top Rated 2023"].map((credential, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-white/40 dark:bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 lg:px-4 py-3 shadow-lg"
              >
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-xs lg:text-s font-medium dark:text-white">{credential}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div >
    </header >
  )
}
export default UserHeader