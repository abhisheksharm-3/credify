import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiLink, RiFileTextLine, RiDeleteBin6Line, RiCheckboxCircleLine } from "@remixicon/react";
import { FileInfo, FileType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  function normalizeFile(file: any): FileInfo {
    return {
      $collectionId: file.$collectionId,
      $createdAt: file.$createdAt,
      $databaseId: file.$databaseId,
      $id: file.$id,
      $permissions: file.$permissions || [],
      $updatedAt: file.$updatedAt,
      fileId: file.fileId,

      fileName: file.fileName || file.media_title,
      fileSize: file.fileSize,
      fileType: file.fileType || file.media_type,
      fileUrl: file.fileUrl,
      userId: file.userId,
      verified: file.verified,
      tampered: file.is_tampered || file.tampered,
      video_hash: file.video_hash,
      collective_audio_hash: file.collective_audio_hash,
      image_hash: file.image_hash,
      is_tampered: file.is_tampered,
      is_deepfake: file.is_deepfake,
      media_title: file.media_title,
      media_type: file.media_type,
      verificationDate: file.verificationDate,
      fact_check: file.fact_check
    };
  }

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/content/get`);
        const data = await response.json();
        const normalizedFiles = data.files.map(normalizeFile);
        setFiles(normalizedFiles);
        setIsLoading(false);
        console.log(normalizedFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [userId]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/content/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: fileId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(files.filter(file => file.$id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };


  const handleVerificationRedirect = (file: FileInfo) => {
    let redirectUrl;
    if (!file.verified) {
      redirectUrl = `/content/${file.fileId}`
    } else if (file.video_hash) {
      redirectUrl = `/verify/${file.video_hash}`;
    } else {
      redirectUrl = `/verify/${file.image_hash}`;
    }
    window.location.href = redirectUrl;
  };
  return (
    <Card className="col-span-2 lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
        <CardDescription className="text-sm">A list of recently uploaded content and their details.</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!isLoading && !hasError && files.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="font-semibold">File Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Uploaded</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.slice(0, 3).map((file) => (
                <TableRow key={file.$id} className="transition-colors duration-150">
                  <TableCell>
                    <div className="font-medium">{file.fileName}</div>
                    <div className="text-sm text-gray-500">
                      {file.fileUrl ? (
                        <Link href={file.fileUrl} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center" prefetch={false} target="_blank">
                          <RiLink className="pr-1" />
                          View File
                        </Link>
                      ) : (
                        null
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">{file.fileType?.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{file.fileSize ? formatFileSize(file.fileSize) : "N/A"}</TableCell>
                  <TableCell>{file.$createdAt ? formatDate(file.$createdAt) : "Unknown"}</TableCell>
                  <TableCell>
                    {
                      file.tampered ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">Tampered</Badge>
                      ) : file.verified ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                      )
                    }


                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={file.verified ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50" : "text-green-600 hover:text-green-800 hover:bg-green-50"}
                              onClick={() => handleVerificationRedirect(file)}
                            >
                              {file.verified ? (
                                <RiFileTextLine className="w-4 h-4" />
                              ) : (
                                <RiCheckboxCircleLine className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{file.verified ? "View Details" : "Verify Content"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {!file.verified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => handleDelete(file.$id)}
                              >
                                <RiDeleteBin6Line className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete File</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && !hasError && files.length === 0 && (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No files found.</p>
          </div>
        )}
        {!isLoading && hasError && (
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">Error fetching files.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
