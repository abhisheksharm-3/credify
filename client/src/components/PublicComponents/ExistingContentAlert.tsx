import React from "react";
import CopyrightDispute from "./CopyrightExists";
import { VerificationResult } from "@/lib/frontend-types";


interface ExistingContentAlertProps {
  result: VerificationResult;
}

export default function ExistingContentAlert({ result }: ExistingContentAlertProps) {
  return (
    <div className="space-y-4">
       <CopyrightDispute
/*         copyrightHolder={result.copyright_holder}
 */      />
    </div>
  );
}