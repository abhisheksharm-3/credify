import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RiLink, RiFileTextLine, RiDeleteBin6Line } from "@remixicon/react";
import { FileType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/content/get`);
        const data = await response.json();
        setFiles(data.files);
        setIsLoading(false);
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
  
      // Remove the deleted file from the state
      setFiles(files.filter(file => file.$id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      // Handle error (e.g., show an error message to the user)
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
                <TableHead className="font-semibold ">File Name</TableHead>
                <TableHead className="font-semibold ">Type</TableHead>
                <TableHead className="font-semibold ">Size</TableHead>
                <TableHead className="font-semibold ">Uploaded</TableHead>
                <TableHead className="font-semibold ">Status</TableHead>
                <TableHead className="font-semibold ">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.$id} className="transition-colors duration-150">
                  <TableCell>
                    <div className="font-medium ">{file.fileName}</div>
                    <div className="text-sm text-gray-500">
                      <Link href={file.fileUrl} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center" prefetch={false} target="_blank">
                        <RiLink className="pr-1" />
                        View File
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">{file.fileType.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="">{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell className="">{formatDate(file.$createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                              <RiFileTextLine className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDelete(file.$id)}>
                              <RiDeleteBin6Line className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete File</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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