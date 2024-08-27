"use client";
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
import { UploadIcon } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

export function UploadVideoDialog() {
  const router = useRouter();

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
        <UploadDropzone
          endpoint="contentUploader"
          onClientUploadComplete={(res) => {
            console.log("Files: ", res);
            if (res && res.length > 0) {
              // Assuming the first file's fileId is what we want
              const fileId = res[0].key;
              // Redirect to the content page
              router.push(`/content/${fileId}`);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
          appearance={{
            button: "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-ready:focus:ring-2 ut-ready:focus:ring-blue-500 ut-ready:focus:ring-offset-2 ut-ready:text-white ut-ready:font-semibold ut-ready:py-2 ut-ready:px-4 ut-ready:rounded-lg ut-ready:shadow-sm ut-ready:transition-all duration-200 cursor-pointer",
          }}
          className="border-[1px] transition-all border-gray-300 dark:border-gray-600 duration-500 hover:border-blue-500 dark:hover:border-blue-400"
        />
      </DialogContent>
    </Dialog>
  );
}