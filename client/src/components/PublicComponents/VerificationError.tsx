import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function VerificationError() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant="destructive" className="animate-pulse shadow-lg">
        <AlertCircle className="h-6 w-6" />
        <AlertTitle className="text-xl font-semibold mb-2">Verification Process Interrupted</AlertTitle>
        <AlertDescription className="text-base">
          We encountered an issue while retrieving the verification data. Please try again in a few moments or contact our support team if the problem persists.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}