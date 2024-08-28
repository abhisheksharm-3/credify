import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, Award, X } from "lucide-react"
import { User } from '@/lib/types'
import { getLoggedInUser } from '@/lib/server/appwrite'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
    { title: 'Video Introduction', completed: false },
  ];

  return (
    <header className="relative bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center md:space-x-8 mb-6 md:mb-0"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl p-1"
              >
                <img
                  src="/api/placeholder/160/160"
                  alt="Profile Picture"
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg"
              >
                <Award className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl font-bold mb-2 text-foreground"
              >
                {user?.name || ""}
              </motion.h1>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center justify-center md:justify-start"
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-xl font-semibold text-foreground">4.9 / 5 Trust Rating</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-purple-500/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg cursor-pointer"
                >
                  {isVerified ? (
                    <CheckCircle className="w-6 h-6 text-white mr-2" />
                  ) : (
                    <X className="w-6 h-6 text-white mr-2" />
                  )}
                  <span className="text-sm font-medium text-white">
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
                className="flex items-center bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg"
              >
                <CheckCircle className="w-6 h-6 text-white mr-2" />
                <span className="text-sm font-medium text-white">{credential}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </header>
  )
}

export default UserHeader