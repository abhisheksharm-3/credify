"use client";

import { ArrowLeftRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraView } from "./camera-view";
import { FC, useRef } from "react";
import { CameraType } from "@/components/ui/camera/camera-types";
import { useCamera } from "@/components/ui/camera/camera-provider";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CameraProps {
  onClosed: () => void;
  onCapturedImages: (images: string[]) => void;
}

const Camera: FC<CameraProps> = ({ onClosed, onCapturedImages }) => {
  const camera = useRef<CameraType>();
  const { images, addImage, resetImages, stopStream, removeImage } = useCamera();

  const handleCapture = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (camera.current) {
      const imageData = camera.current.takePhoto();
      if (imageData) {
        resetImages(); // Clear any previous images
        addImage(imageData); // Add the new image
      }
    }
  };

  const handleOnClosed = () => {
    stopStream();
    onClosed();
  };

  const handleOnCapturedImages = () => {
    if (images.length > 0) {
      onCapturedImages(images);
      resetImages();
      handleOnClosed();
    }
  };

  const handleRetake = () => {
    resetImages(); // Clear captured images
  };

  return (
    <div className="z-10 flex min-w-[calc(100vw_-_theme(spacing.4))] flex-1 flex-col ">
      <div className="relative w-full ">
        <div className="absolute z-10 w-full md:h-[calc(93vh_-_theme(spacing.12))] md:w-[20%] ">
          <div className="relative left-10 top-5">
            {images.length === 0 && (
              <Button
                className="rounded-full p-4 opacity-80 hover:opacity-100"
                size={"icon"}
                variant={images.length > 0 ? "destructive" : "default"}
                onClick={handleOnClosed}
              >
                <X className="fixed h-6 w-6" />
              </Button>)}
          </div>
        </div>

        {/* Conditionally render CameraView only if no images are captured */}
        {images.length === 0 ? (
          <CameraView ref={camera} />
        ) : (
          <div className="flex items-center justify-center w-full h-screen p-2">
            <div className=" relative w-auto lg:w-4/5 h-auto">
              <img src={images[0]} alt="captured" className="max-w-full max-h-full border-4 border-purple-600 rounded-3xl" />
              {/* Buttons for confirming or retaking the image */}
              <div className="w-full mt-4 items-center justify-center flex-row flex space-x-4">
                <button onClick={handleOnCapturedImages} className="inline-flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-purple-800 text-white dark:text-purple-80 transition-colors hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2">
                  <CheckIcon className="h-6 w-6" />
                </button>
                <button onClick={handleRetake}
                  className="inline-flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-gray-500 text-gray-50 transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  <XIcon className="h-6 w-6" />
                </button>

              </div>
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="absolute bottom-2 left-[45%] z-20 md:bottom-auto md:left-auto md:right-14 md:top-[50%] ">
            <Button
              className={cn(
                "group h-12 w-12 rounded-full p-8 opacity-80 hover:opacity-100"
              )}
              size={"icon"}
              variant={"default"}
              onClick={handleCapture}
            >
              <div className="fixed h-11 w-11 rounded-full bg-primary-foreground group-hover:bg-primary-foreground/60"></div>
            </Button>
            <div className="absolute bottom-20 right-4">
              <SwitchCamera />
            </div>
          </div>

        )}
      </div>
    </div>
  );
};
function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
function SwitchCamera() {
  const { devices, setActiveDeviceId, switchCamera } = useCamera();

  if (devices.length === 2) {
    return (
      <Button
        variant="default"
        size="icon"
        className="rounded-full p-4 opacity-40 hover:opacity-100"
        onClick={switchCamera}
      >
        <ArrowLeftRight className="fixed h-6 w-6" />
      </Button>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"default"}
          size={"icon"}
          className="rounded-full p-4 opacity-40 hover:opacity-100"
        >
          <ArrowLeftRight className="fixed h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Camera</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Select
            onValueChange={(value) => {
              setActiveDeviceId(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose Camera" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default Camera;
