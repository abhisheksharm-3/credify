import React from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContentIntegrityAlertProps {
  forgeryResult: any;
}

export default function ContentIntegrityAlert({ forgeryResult }: ContentIntegrityAlertProps) {

  const isManipulated = forgeryResult?.isManipulated;

  return (
    <Alert 
      variant={isManipulated ? "destructive" : "default"} 
      className={`border-2 shadow-lg ${isManipulated ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'}`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {isManipulated ? (
          <ShieldAlert className="h-12 w-12 text-red-500 dark:text-red-400" />
        ) : (
          <ShieldCheck className="h-12 w-12 text-green-500 dark:text-green-400" />
        )}
        <div className="flex-1">
          <AlertTitle className="text-2xl font-semibold mb-2">
            {isManipulated ? "Caution: Content May Be Altered" : "Good News: Content Looks Authentic"}
          </AlertTitle>
          <AlertDescription className="text-lg">
            {isManipulated
              ? "Our smart tools spotted signs that this content might have been changed. It's a good idea to double-check from other sources."
              : "Our thorough check didn't find any signs of tampering. This content appears to be original and trustworthy."}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}