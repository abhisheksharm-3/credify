import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { UploadedFileType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { RiLink } from "@remixicon/react";

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [files, setFiles] = useState<UploadedFileType[]>([]);
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

  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A list of recently uploaded content and their status.</CardDescription>
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
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                    <Link href={`https://utfs.io/f/${file.key}`} className="text-primary hover:underline flex items-center" prefetch={false} target="_blank">
                        <RiLink className="pr-1" />
                        View File
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={file.status === "Uploaded" ? "secondary" : "outline"}>{file.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="#" className="text-primary" prefetch={false}>
                      View Report
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