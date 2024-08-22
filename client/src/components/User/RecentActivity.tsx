import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoData } from "@/lib/types";

interface RecentActivityProps {
  videos: VideoData[];
}

export function RecentActivity({ videos }: RecentActivityProps) {
  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A list of recently verified videos and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{video.title}</div>
                  <div className="text-sm text-muted-foreground">{video.uploadDate}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={video.status === 'Verified' ? 'secondary' : 'outline'}>{video.status}</Badge>
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
      </CardContent>
    </Card>
  );
}