import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <motion.div
      className="mt-8 flex items-center justify-center text-sm text-muted-foreground bg-accent p-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Lock className="w-5 h-5 mr-3 text-primary" />
      <span>Your privacy is our utmost priority. We do not store or retain your content after the verification process is complete.</span>
    </motion.div>
  );
}