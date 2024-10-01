import React, { useState } from "react";
import { CheckCircle, LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ShareableLinkProps {
  shareableLink: string;
}

export default function ShareableLink({ shareableLink }: ShareableLinkProps) {
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        setIsLinkCopied(true);
        toast.success("Verification link copied to clipboard", {
          description: "You can now share this link with others to verify your content.",
        });
        setTimeout(() => setIsLinkCopied(false), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy link", {
          description: "Please try again or copy the link manually.",
        });
      });
  };

  return (
    <div className="space-y-4 p-2">
      <h4 className="text-xl font-semibold">Share Verification Result</h4>
      <p className="text-sm text-muted-foreground">
        Use this secure link to allow others to verify the authenticity of your content:
      </p>
      <div className="flex gap-2">
        <Input value={shareableLink} readOnly className="bg-secondary/10 font-mono text-sm" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCopyLink} variant="secondary" className="min-w-[100px]">
                {isLinkCopied ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                {isLinkCopied ? "Copied!" : "Copy Link"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLinkCopied ? "Link copied to clipboard" : "Copy verification link"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}