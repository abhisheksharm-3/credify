"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadIcon, CheckCircle, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { UploadDropzone } from '@/lib/uploadthing';
import CustomPlayer from '../Utils/CustomPlayer';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadedFileType } from '@/lib/frontend-types';
import { Progress } from "@/components/ui/progress";

export default function UploadContentDialog() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleProceedToVerification = () => {
    if (uploadedFile) {
      router.push(`/content/${uploadedFile.key}`);
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setUploadedFile(null);
    setErrorMessage(null);
    setUploadProgress(0);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <UploadIcon className="h-4 w-4 mr-2" />
          Verify New Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Content for Verification</DialogTitle>
          <DialogDescription>
            Upload a video or image to check its authenticity and attribution.
          </DialogDescription>
        </DialogHeader>
        {uploadState === 'idle' && (
          <UploadDropzone
            endpoint="contentUploader"
            onUploadBegin={() => setUploadState('uploading')}
            onClientUploadComplete={(res: UploadedFileType[]) => {
              console.log("Files: ", res);
              if (res && res.length > 0) {
                setUploadState('success');
                setUploadedFile(res[0]);
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              setErrorMessage(error.message);
              setUploadState('error');
            }}
            onUploadProgress={(progress: number) => {
              setUploadProgress(progress);
            }}
            appearance={{
              button: "bg-primary text-primary-foreground hover:bg-primary/90",
              allowedContent: "text-xs text-muted-foreground",
            }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 transition-all duration-300 hover:border-primary/50"
          />
        )}
        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Uploading your content...</p>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
        {uploadState === 'success' && uploadedFile && (
          <div className="flex flex-col items-center justify-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
            <p className="mb-4 text-sm text-muted-foreground">Upload successful! Preview your content:</p>
            <div className="w-full mb-4 flex items-center justify-center">
              {uploadedFile.name.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? (
                <div className="flex justify-center max-h-[300px] overflow-hidden rounded-lg">
                  <CustomPlayer url={`https://utfs.io/f/${uploadedFile.key}`} />
                </div>
              ) : uploadedFile.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                <div className="flex justify-center max-h-[300px] overflow-hidden rounded-lg">
                  <img
                    src={`https://utfs.io/f/${uploadedFile.key}`}
                    alt="Uploaded content"
                    className="max-w-full h-auto object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unsupported file type</p>
              )}
            </div>
          </div>
        )}
        {uploadState === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>
              {errorMessage || "An error occurred during upload. Please try again."}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter className="sm:justify-start">
          {uploadState === 'success' && (
            <Button onClick={handleProceedToVerification} className="w-full">
              Begin Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {uploadState === 'error' && (
            <Button onClick={resetUpload} variant="secondary" className="w-full">
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}