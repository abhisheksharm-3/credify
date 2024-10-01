import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiLink, RiFileTextLine, RiDeleteBin6Line, RiCheckboxCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFiles } from "@/hooks/useFiles";
import { RecentActivityProps } from "@/lib/frontend-types";
import { formatDate, formatFileSize, handleVerificationRedirect, truncateFileName } from "@/lib/frontend-function";

export function RecentActivity({ files }: RecentActivityProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { setFiles } = useFiles();

  useEffect(() => {
    if (files.length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [files])

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
                <TableHead className="hidden md:table-cell font-semibold">Type</TableHead>
                <TableHead className=" hidden md:table-cell font-semibold">Size</TableHead>
                <TableHead className=" hidden md:table-cell font-semibold">Uploaded</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.slice(0, 3).map((file) => (
                <TableRow key={file.$id} className="transition-colors duration-150">
                  <TableCell>
                    <div className="font-medium">{truncateFileName(file.fileName || "", 13)}</div>
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
                  <TableCell className="hidden md:table-cell" >
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">{file.fileType?.toUpperCase().substring(0, 5)}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell" >{file.fileSize ? formatFileSize(file.fileSize) : "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell" >{file.$createdAt ? formatDate(file.$createdAt) : "Unknown"}</TableCell>
                  <TableCell>
                    {
                      file.tampered ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">Tampered</Badge>
                      ) : file.verified ? (
                        <Badge variant="secondary" className="bg-green-100 px-4 text-green-800">Verified</Badge>
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
