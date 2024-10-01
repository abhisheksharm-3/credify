import React from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VerificationInProgressProps {
  progress: number;
}

export default function VerificationInProgress({ progress }: VerificationInProgressProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 p-8 mt-4 rounded-lg bg-secondary/10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <RefreshCw className="w-20 h-20 text-primary animate-spin" />
      <h3 className="text-3xl font-semibold">Verification in Progress</h3>
      <p className="text-center text-muted-foreground max-w-md">
        We&apos;re meticulously analyzing your content to ensure its authenticity. This process guarantees the highest level of accuracy and integrity.
      </p>
      <Progress value={progress} className="w-full mt-4" />
      <p className="text-sm font-medium text-muted-foreground">{Math.round(progress)}% Complete</p>
    </motion.div>
  );
}