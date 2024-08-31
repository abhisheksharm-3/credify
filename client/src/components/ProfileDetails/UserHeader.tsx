import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, Award, X } from "lucide-react"
import { User } from '@/lib/types'
import { getLoggedInUser } from '@/lib/server/appwrite'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User as UserIcon } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import { FC } from "react"
import { RiVerifiedBadgeFill,RiStarFill } from '@remixicon/react'

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}
interface UserHeaderProps {
  user: User | null
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  const [isVerified, setIsVerified] = useState(false);

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

  const verificationSteps = [
    { title: 'Email Verification', completed: true },
    { title: 'Realtime Image Upload', completed: false },
    { title: 'Government ID Upload', completed: false },
  ];

  return (
    <header className="relative bg-gradient-to-b from-purple-600 to-white dark:bg-gradient-to-r dark:from-black/50 dark:to-purple-600/30 backdrop-blur-lg shadow-lg ">
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
                  <span>
                    Verified Videos: 124</span>
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
                  <span className="text-xs lg:text-s font-medium dark:dark:text-white">
                    {isVerified ? "Verified Creator" : "Unverified Creator"}
                  </span>
                </motion.div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Creator Verification Process</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {verificationSteps.map((step, index) => (
                    <div key={index} className="flex items-center mb-3">
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm ${step.completed ? 'text-green-500' : 'text-red-500'}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
                <Button className="mt-4">Start Verification</Button>
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
      </motion.div>
    </header>
  )
}

export default UserHeader