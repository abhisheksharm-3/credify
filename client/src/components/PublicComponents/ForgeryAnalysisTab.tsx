import React from "react";
import { AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ForgeryDetectionResult } from "@/lib/types";

interface ForgeryAnalysisTabProps {
  forgeryResult: ForgeryDetectionResult;
}

export default function ForgeryAnalysisTab({ forgeryResult }: ForgeryAnalysisTabProps) {
  const getSimplifiedMethodName = (method: string) => {
    switch (method) {
      case "imageManipulation":
        return "Changes to the image";
      case "ganGenerated":
        return "Computer-generated content";
      case "faceManipulation":
        return "Altered facial features";
      case "audioDeepfake":
        return "Artificial voice or audio";
      default:
        return method;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Authenticity Check</CardTitle>
      </CardHeader>
      <CardContent>
        {forgeryResult ? (
          <div className="space-y-4">
            <Alert variant={forgeryResult.isManipulated ? "destructive" : "default"}>
              {forgeryResult.isManipulated ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <AlertTitle>
                {forgeryResult.isManipulated
                  ? "Possible alterations detected"
                  : "No alterations detected"}
              </AlertTitle>
              <AlertDescription>
                {forgeryResult.isManipulated
                  ? "Our analysis suggests this content might have been modified. Here's what we found:"
                  : "Our analysis didn't find any signs of tampering or artificial creation in this content."}
              </AlertDescription>
            </Alert>

            {forgeryResult.isManipulated && forgeryResult.detectionMethods && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Potential modifications:</h4>
                <ul className="list-disc ml-6">
                  {Object.entries(forgeryResult.detectionMethods).map(
                    ([method, isDetected]) =>
                      isDetected && (
                        <li key={method}>{getSimplifiedMethodName(method)}</li>
                      )
                  )}
                </ul>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              Please note: This analysis is based on automated checks and may not be 100% accurate. When in doubt, verify the content with trusted sources.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            We couldn't perform an authenticity check on this content. This might be due to technical issues or unsupported content type.
          </p>
        )}
      </CardContent>
    </Card>
  );
}