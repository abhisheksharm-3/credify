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
          <div className="flex flex-row items-center gap-2 border-2">
            <div className="">           
             <ShieldAlert className="h-8 w-8 mr-4" />
            </div>
            <p className="text-2xl font-semibold mb-1">Content Integrity Alert</p>
          </div>

          <AlertDescription className="text-lg">
            Our advanced system has detected potential tampering with this content. We recommend further investigation and verification.
          </AlertDescription>
        </>
      ) : (
        <>
          <ShieldCheck className="h-8 w-8" />
          <AlertTitle className="text-2xl font-semibold mb-2">Content Authenticity Confirmed</AlertTitle>
          <AlertDescription className="text-lg">
            Our rigorous verification process has confirmed the authenticity of this content. You can trust its integrity.
          </AlertDescription>
        </>
      )}
    </Alert>
  );
}