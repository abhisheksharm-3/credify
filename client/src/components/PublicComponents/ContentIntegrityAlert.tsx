import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContentIntegrityAlertProps {
  forgeryResult: any;
}

export default function ContentIntegrityAlert({ forgeryResult }: ContentIntegrityAlertProps) {
  return (
    <Alert variant={forgeryResult?.isManipulated ? "destructive" : "default"} className="border-2 shadow-lg">
      {forgeryResult?.isManipulated ? (
        <>
         <div className="flex flex-row gap-2 items-center">
         <ShieldAlert className="h-8 w-8" />
          <AlertTitle className="text-2xl ml-1 font-semibold">Content Integrity Alert</AlertTitle>
          </div>
          <AlertDescription className="text-lg">
            Our advanced system has detected potential tampering with this content. We recommend further investigation and verification.
          </AlertDescription>
        </>
      ) : (
        <>
          <div className="flex flex-row gap-2 items-center">
            <ShieldCheck className="h-8 w-8" />
            <AlertTitle className="text-2xl font-semibold">Content Authenticity Confirmed</AlertTitle>
          </div>

          <AlertDescription className="text-lg">
            Our rigorous verification process has confirmed the authenticity of this content. You can trust its integrity.
          </AlertDescription>
        </>
      )}
    </Alert>
  );
}