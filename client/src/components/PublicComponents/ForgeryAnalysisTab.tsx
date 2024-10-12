import React from "react";
import { AlertTriangle, CheckCircle, Image, Cpu, User, Mic, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ForgeryAnalysisTabProps } from "@/lib/types";

// Define the keys for the detection methods
type DetectionMethodKey = 'imageManipulation' | 'ganGenerated' | 'faceManipulation' | 'audioDeepfake';

export default function ForgeryAnalysisTab({ forgeryResult }: ForgeryAnalysisTabProps) {
  if (!forgeryResult) {
    return (
      <div className="p-4 bg-background rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Forgery Analysis</h2>
        <p className="text-muted-foreground">Forgery analysis data is not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant={forgeryResult.isManipulated ? "destructive" : "default"}>
        {forgeryResult.isManipulated ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        <AlertTitle className="ml-2 text-lg">
          {forgeryResult.isManipulated ? "Potential Tampering Detected" : "No Tampering Detected"}
        </AlertTitle>
        <AlertDescription>
          {forgeryResult.isManipulated && forgeryResult.detectionMethods ? (
            <div className="mt-4 space-y-3">
              {forgeryResult.detectionMethods.imageManipulation && (
                <div className="flex items-start p-3 pl-0 bg-background/50 rounded-md">
                  <div className="mr-3 mt-1"><Image className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-medium text-sm flex items-center">Image Manipulation
                      <div className="text-xs flex items-center "><Info className="h-4 w-4" />Experimental</div>
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1">
                      Detected edits such as object removal, cloning, or additions within the image.
                    </p>
                  </div>
                </div>
              )}
              {forgeryResult.detectionMethods.ganGenerated && (
                <div className="flex items-start p-3 pl-0 bg-background/50 rounded-md">
                  <div className="mr-3 mt-1"><Cpu className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-medium text-sm">GAN Generated</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This content was flagged as AI-generated, likely created by a generative adversarial network (GAN).
                    </p>
                  </div>
                </div>
              )}
              {forgeryResult.detectionMethods.faceManipulation && (
                <div className="flex items-start p-3 pl-0 bg-background/50 rounded-md">
                  <div className="mr-3 mt-1"><User className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-medium text-sm">Face Manipulation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Alterations to facial features were identified, suggesting possible deepfake techniques.
                    </p>
                  </div>
                </div>
              )}
              {forgeryResult.detectionMethods.audioDeepfake && (
                <div className="flex items-start p-3 pl-0 bg-background/50 rounded-md">
                  <div className="mr-3 mt-1"><Mic className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-medium text-sm flex items-center space-x-2">
                      <span>Audio Deepfake</span>
                      <div className="text-xs flex text-red-600 border-red-600 border-[1px] items-center space-x-1">
                        <Info className="h-4 w-4 text-red-600 shrink-0" />
                        <span>Experimental</span>
                      </div>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Synthetic or manipulated voice patterns were detected, mimicking a real person&apos;s speech.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
    </div>
  );
}
