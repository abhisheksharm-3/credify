import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationResult } from "@/lib/frontend-types";

interface VerificationDetailsTabProps {
  result: VerificationResult;
}

export default function VerificationDetailsTab({ result }: VerificationDetailsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {result.video_hash && (
            <li className="break-all">
              <strong>Video Hash:</strong> {result.video_hash}
            </li>
          )}
          {result.collective_audio_hash && (
            <li className="break-all">
              <strong>Collective Audio Hash:</strong> {result.collective_audio_hash}
            </li>
          )}
          {result.image_hash && (
            <li className="break-all">
              <strong>Image Hash:</strong> {result.image_hash}
            </li>
          )}
          {result.audio_hash && (
            <li className="break-all">
              <strong>Audio Hash:</strong> {result.audio_hash}
            </li>
          )}
          {result.frame_hash && (
            <li className="break-all">
              <strong>Frame Hash:</strong> {result.frame_hash}
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
