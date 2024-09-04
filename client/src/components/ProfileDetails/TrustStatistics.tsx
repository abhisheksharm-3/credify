import { FC } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Define props for the icons
interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

const StarIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
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
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ThumbsUpIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
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
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const VideoIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
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

// Main component
const TrustStatistics: FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-8 mb-16 ">
      <motion.div
        className="bg-card text-card-foreground border-[1px] border-gray-500 
        rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-card-foreground/20 rounded-full p-3">
            <StarIcon className="w-6 h-6 text-card-foreground" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Trust Score</h3>
            <p className="text-2xl font-bold">4.8</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-card text-card-foreground border-[1px] border-gray-500  rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-card-foreground/20 rounded-full p-3">
            <VideoIcon className="w-6 h-6 text-card-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Verified Videos</h3>
            <p className="text-2xl font-bold">124</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-card text-card-foreground border-[1px] border-gray-500  rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-card-foreground/20 rounded-full p-3">
            <StarIcon className="w-6 h-6 text-card-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Avg. Trust Rating</h3>
            <p className="text-2xl font-bold">4.6</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-card text-card-foreground border-[1px] border-gray-500 rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-card-foreground/20 rounded-full p-3">
            <ThumbsUpIcon className="w-6 h-6 text-card-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Total Likes</h3>
            <p className="text-2xl font-bold">78,901</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrustStatistics;
