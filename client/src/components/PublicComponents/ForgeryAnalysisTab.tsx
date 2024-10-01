import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ForgeryAnalysisTabProps } from "@/lib/types";


export default function ForgeryAnalysisTab({ forgeryResult }: ForgeryAnalysisTabProps) {

  if (!forgeryResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forgery Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Forgery analysis data is not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgery Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert variant={forgeryResult.isManipulated ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4 mt-[-4px]" />
            <AlertTitle>
              {forgeryResult.isManipulated ? "Potential Tampering Detected" : "No Tampering Detected"}
            </AlertTitle>
            <AlertDescription>
              {forgeryResult.isManipulated && forgeryResult.detectionMethods && (
                <div className="flex flex-col">
                  <ul className="list-disc ml-6">
                    {forgeryResult.detectionMethods.imageManipulation && <li>Image Manipulation</li>}
                    {forgeryResult.detectionMethods.ganGenerated && <li>GAN Generated</li>}
                    {forgeryResult.detectionMethods.faceManipulation && <li>Face Manipulation</li>}
                    {forgeryResult.detectionMethods.audioDeepfake && <li>Audio Deepfake</li>}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}