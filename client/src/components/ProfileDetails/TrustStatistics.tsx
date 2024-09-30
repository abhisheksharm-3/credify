import { FC } from "react";
import { motion } from "framer-motion";
import { TriangleAlert, X,Check } from "lucide-react";

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
            <Check className="w-6 h-6 text-card-foreground" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Verified Videos1</h3>
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
            <X className="w-6 h-6 text-white" />
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
            <TriangleAlert className="w-6 h-6 text-card-foreground" />
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
