import { FC } from "react";
import { motion } from "framer-motion";

// Define props for the icons
interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

// Tampered Icon (Triangle Alert)
const TamperedIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
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
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

// Verified Icon (Tick)
const VerifiedIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
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
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Unverified Icon (Cross)
const UnverifiedIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Main component for trust statistics
const TrustStatistics: FC<{ verifiedCount: number; unverifiedCount: number; tamperedCount: number }> = ({
  verifiedCount,
  unverifiedCount,
  tamperedCount,
}) => {
  return (
    <div className="  gap-6 w-full m-2 mb-16 flex flex-col md:flex-row md:justify-around  justify-center items-center ">
      {/* Verified */}
      <motion.div
        className="bg-card w-full py-5 text-card-foreground border-[1px] border-gray-500 rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-green-600 rounded-full p-3">
            <VerifiedIcon className="w-6 h-6 text-card-foreground" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Verified Videos</h3>
            <p className="text-2xl font-bold">{verifiedCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Unverified */}
      <motion.div
        className="bg-card w-full py-5 text-card-foreground border-[1px] border-gray-500 rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-500 rounded-full p-3">
            <UnverifiedIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Unverified Videos</h3>
            <p className="text-2xl font-bold">{unverifiedCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Tampered */}
      <motion.div
        className="bg-card w-full py-5 text-card-foreground border-[1px] border-gray-500 rounded-xl p-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-600 rounded-full p-3">
            <TamperedIcon className="w-6 h-6 text-card-foreground" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Tampered Videos</h3>
            <p className="text-2xl font-bold">{tamperedCount}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrustStatistics;
