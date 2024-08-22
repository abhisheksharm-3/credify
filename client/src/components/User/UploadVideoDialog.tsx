"use client";
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
          // Do something with the response
          console.log("Files: ", res);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
        appearance={{
            button: "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-ready:focus:ring-2 ut-ready:focus:ring-blue-500 ut-ready:focus:ring-offset-2 ut-ready:text-white ut-ready:font-semibold ut-ready:py-2 ut-ready:px-4 ut-ready:rounded-lg ut-ready:shadow-sm ut-ready:transition-all duration-200 cursor-pointer",
          }}
          className="border-[1px] transition-all border-gray-300 dark:border-gray-600 duration-500 hover:border-blue-500 dark:hover:border-blue-400"
      />
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}