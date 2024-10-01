import React from "react";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ExistingContentAlert() {
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800">
      <InfoIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      <AlertTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">Already Checked</AlertTitle>
      <AlertDescription className="text-blue-600 dark:text-blue-200">
        Good news! This content has been verified before. You can trust its authenticity.
      </AlertDescription>
    </Alert>
  );
}