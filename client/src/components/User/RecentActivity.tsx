import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RiLink, RiFileTextLine } from "@remixicon/react";
import { FileType } from "@/lib/types";



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

  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A list of recently uploaded content and their details.</CardDescription>
      </CardHeader>
      <CardContent>
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
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.$id}>
                  <TableCell>
                    <div className="font-medium">{file.fileName}</div>
                    <div className="text-sm text-muted-foreground">
                      <Link href={file.fileUrl} className="text-primary hover:underline flex items-center" prefetch={false} target="_blank">
                        <RiLink className="pr-1" />
                        View File
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{file.fileType}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell>{formatDate(file.$createdAt)}</TableCell>
                  <TableCell>
                    <Link href="#" className="text-primary flex items-center" prefetch={false}>
                      <RiFileTextLine className="pr-1" />
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && !hasError && files.length === 0 && (
          <div className="flex justify-center items-center h-40">
            <p>No files found.</p>
          </div>
        )}
        {!isLoading && hasError && (
          <div className="flex justify-center items-center h-40">
            <p>Error fetching files.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}