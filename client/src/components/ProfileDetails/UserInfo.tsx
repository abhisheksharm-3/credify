import { FC } from 'react';
import { motion } from 'framer-motion';
import { RiStarFill, RiVerifiedBadgeFill} from '@remixicon/react';
import { UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: {
    name: string;
  } | null;
  userProfileImage: string;
}

const UserInfo: FC<UserProfileProps> = ({ user, userProfileImage }) => {
  return (
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
            className={`w-25 h-25 rounded-full overflow-hidden shadow-lg bg-white/5 border-3 border-black dark:border-white backdrop-blur-lg flex items-center justify-center ${
              userProfileImage.length > 0 ? '' : 'p-1'
            }`}
          >
            {userProfileImage.length > 0 ? (
              <div className="h-[150px] p-0 w-[150px] overflow-hidden flex items-center justify-center">
                <img
                  src={userProfileImage}
                  alt="Profile"
                  className="rounded-full h-[150px] w-[150px] object-cover"
                />
              </div>
            ) : (
              <UserIcon size={135} strokeWidth={1} />
            )}
          </motion.div>
        </div>
        <div className="text-start md:text-left ml-4">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl md:text-2xl lg:text-3xl font-bold dark:text-white"
          >
            {user?.name || ""}
          </motion.h1>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-start flex-col"
          >
            <div className="flex flex-row items-center gap-2 text-sm md:text-base lg:text-lg dark:text-white mt-2">
              <RiStarFill className="text-yellow-500" size={20} />
              <span>Trust Score: 4.8</span>
            </div>
            <div className="flex flex-row items-center gap-2 text-sm md:text-base lg:text-lg dark:text-white mt-2">
              <RiVerifiedBadgeFill className="text-blue-600" size={20} />
              <span>Verified Videos: 124</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserInfo;
