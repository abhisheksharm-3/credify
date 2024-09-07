'use client'

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UploadDropzone } from '@/lib/uploadthing';

interface UploadSectionProps {
  onUploadComplete: (res: { key: string; url: string; name: string }[]) => void;
  onUploadError: (error: string) => void;
}

export default function UploadSection({ onUploadComplete, onUploadError }: UploadSectionProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <UploadDropzone
          endpoint="analyzeContent"
          onClientUploadComplete={onUploadComplete}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            onUploadError("Failed to upload content. Please try again.");
          }}
          appearance={{
            button: "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-ready:focus:ring-2 ut-ready:focus:ring-blue-500 ut-ready:focus:ring-offset-2 ut-ready:text-white ut-ready:font-semibold ut-ready:py-2 ut-ready:px-4 ut-ready:rounded-lg ut-ready:shadow-sm ut-ready:transition-all duration-200 cursor-pointer",
          }}
          className="border-[1px] transition-all border-gray-300 dark:border-gray-600 duration-500 hover:border-blue-500 dark:hover:border-blue-400"
        />
      </CardContent>
    </Card>
  );
}