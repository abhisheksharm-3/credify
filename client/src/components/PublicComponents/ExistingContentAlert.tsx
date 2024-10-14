import React from "react";
import CopyrightDispute from "./CopyrightExists";
import { VerificationResult } from "@/lib/frontend-types";


interface ExistingContentAlertProps {
  hash: string;
}

export default function ExistingContentAlert({ hash }: ExistingContentAlertProps) {
  return (
    <div className="space-y-4">
       <CopyrightDispute mediaHash={hash || ""}
      />
    </div>
  );
}