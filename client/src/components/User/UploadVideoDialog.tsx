"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadDropzone } from '@/lib/uploadthing';
import CustomPlayer from '../Utils/CustomPlayer';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UploadedFileType = {
  key: string;
  url: string;
  name: string;
};

export function UploadVideoDialog() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProceedToVerification = () => {
    if (uploadedFile) {
      router.push(`/content/${uploadedFile.key}`);
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setUploadedFile(null);
    setErrorMessage(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload New Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Content</DialogTitle>
          <DialogDescription>
            Select a video or image file to upload to your channel.
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
            appearance={{
              button: "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-ready:focus:ring-2 ut-ready:focus:ring-blue-500 ut-ready:focus:ring-offset-2 ut-ready:text-white ut-ready:font-semibold ut-ready:py-2 ut-ready:px-4 ut-ready:rounded-lg ut-ready:shadow-sm ut-ready:transition-all duration-200 cursor-pointer",
            }}
            className="border-[1px] transition-all border-gray-300 dark:border-gray-600 duration-500 hover:border-blue-500 dark:hover:border-blue-400"
          />
        )}
        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-500">Uploading your content...</p>
          </div>
        )}
        {uploadState === 'success' && uploadedFile && (
          <div className="flex flex-col items-center justify-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
            <p className="mb-4 text-sm text-gray-500">Upload successful! Preview your content:</p>
            <div className="w-full mb-4">
              {uploadedFile.name.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? (
                <CustomPlayer url={`https://utfs.io/f/${uploadedFile.key}`} />
              ) : uploadedFile.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                <img src={`https://utfs.io/f/${uploadedFile.key}`} alt="Uploaded content" className="max-w-full h-auto rounded-lg" />
              ) : (
                <p>Unsupported file type</p>
              )}
            </div>
            <Button onClick={handleProceedToVerification} className="mt-4">
              Proceed to Verification
            </Button>
          </div>
        )}
        {uploadState === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage || "An error occurred during upload. Please try again."}
            </AlertDescription>
            <Button onClick={resetUpload} className="mt-4">
              Try Again
            </Button>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}