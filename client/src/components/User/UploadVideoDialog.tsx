"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CopyIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadIcon, CheckCircle, Loader2 } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

export function UploadVideoDialog() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState('idle');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload New Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Video</DialogTitle>
          <DialogDescription>
            Select a video file to upload to your channel.
          </DialogDescription>
        </DialogHeader>
        {uploadState === 'idle' && (
          <UploadDropzone
            endpoint="contentUploader"
            onUploadBegin={() => setUploadState('uploading')}
            onClientUploadComplete={(res) => {
              console.log("Files: ", res);
              if (res && res.length > 0) {
                setUploadState('success');
                const fileId = res[0].key;
                setTimeout(() => {
                  router.push(`/content/${fileId}`);
                }, 2000); // Delay redirect to show success state
              }
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
              setUploadState('idle');
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
            <p className="mt-2 text-sm text-gray-500">Uploading your video...</p>
          </div>
        )}
        {uploadState === 'success' && (
          <div className="flex flex-col items-center justify-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="mt-2 text-sm text-gray-500">Upload successful! Redirecting...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}