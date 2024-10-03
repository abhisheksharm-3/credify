import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationResultType } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon, Copy } from "lucide-react";
import { formatDate } from "@/lib/frontend-function";

interface VerificationDetailsTabProps {
  result: VerificationResultType;
}

export default function VerificationDetailsTab({ result }: VerificationDetailsTabProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const details = [
    { 
      label: "Content Hash", 
      value: result.image_hash || result.video_hash, 
      tooltip: "A unique identifier for the content integrity" 
    },
    { 
      label: "Content Type", 
      value: result.image_hash ? "Image" : "Video", 
      tooltip: "The type of media content" 
    },
    { 
      label: "Verification Date", 
      value: result.verificationDate ? formatDate(result.verificationDate) : undefined, 
      tooltip: "When this content was verified" 
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent>
        <ul className="space-y-4">
          {details.map((detail, index) => (
            detail.value && (
              <li key={index} className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{detail.label}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{detail.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="px-2 py-1 h-auto font-mono text-sm hover:bg-background"
                      >
                        {typeof detail.value === 'string' && detail.value.length > 16 
                          ? `${detail.value.slice(0, 8)}...${detail.value.slice(-8)}`
                          : detail.value}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{detail.label}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">{detail.tooltip}</p>
                        <div className="mt-2 p-2 bg-muted rounded">
                          <code className="text-sm break-all">{detail.value}</code>
                        </div>
                        <Button 
                          className="mt-2" 
                          variant="outline" 
                          onClick={() => copyToClipboard(detail.value ? detail.value.toString() : "", index)}                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copiedIndex === index ? "Copied!" : "Copy to clipboard"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            )
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}