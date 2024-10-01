import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ExistingContentAlert() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Existing Content</AlertTitle>
      <AlertDescription>
        This content has been previously verified, either by you or another user.
      </AlertDescription>
    </Alert>
  );
}