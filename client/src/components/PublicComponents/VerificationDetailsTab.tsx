import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationResult } from "@/lib/frontend-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon, Copy } from "lucide-react";

interface VerificationDetailsTabProps {
  result: VerificationResult;
}

export default function VerificationDetailsTab({ result }: VerificationDetailsTabProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const details = [
    { label: "Content Fingerprint", value: result.video_hash || result.image_hash, tooltip: "A unique identifier for the entire content" },
    { label: "Audio Signature", value: result.collective_audio_hash || result.audio_hash, tooltip: "A unique identifier for the audio in the content" },
    { label: "Visual Signature", value: result.frame_hash, tooltip: "A unique identifier for the visual elements in the content" },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Verification Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          These are unique identifiers that help us verify the authenticity of the content. They're like digital fingerprints for different parts of the media.
        </p>
        <ul className="space-y-4">
          {details.map((detail, index) => (
            detail.value && (
              <li key={index} className="flex items-center space-x-2">
                <span className="font-medium text-gray-700 dark:text-gray-200">{detail.label}:</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="px-2 py-1 h-auto font-mono text-sm">
                      {detail.value.slice(0, 8)}...
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{detail.label}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{detail.tooltip}</p>
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <code className="text-sm break-all">{detail.value}</code>
                      </div>
                      <Button 
                        className="mt-2" 
                        variant="outline" 
                        onClick={() => copyToClipboard(detail.value || "", index)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copiedIndex === index ? "Copied!" : "Copy to clipboard"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{detail.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            )
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}