import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Eye, Image as ImageIcon, MoreVertical, Trash2, Video } from 'lucide-react'
import { toast } from 'sonner'
import {  FileInfo } from '@/lib/types'

interface ContentTableProps {
  files: FileInfo[]
}

export default function ContentTable({ files }: ContentTableProps) {
  function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A'; // Handle undefined case
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  }

  const handleVerificationRedirect = (file: FileInfo) => {
    let redirectUrl;
    if (!file.verified) {
      redirectUrl = `/content/${file.fileId}`;
    } else if (file.video_hash) {
      redirectUrl = `/verify/${file.video_hash}`;
    } else {
      redirectUrl = `/verify/${file.image_hash}`;
    }
    window.open(redirectUrl, '_blank'); // Open in a new tab
  };

  const getStatusColor = (file: FileInfo) => {
    if (file.tampered) {
      return 'bg-red-600 text-white'; 
    }
    return file.verified ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'; 
  }

  const getStatusText = (file: FileInfo) => {
    if (file.tampered) {
      return 'Tampered';
    }
    return file.verified ? 'Verified' : 'Unverified';
  }

  const getContentTypeIcon = (type: FileInfo['fileType']) => {
    return type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />
  }

  const handleDelete = (content: FileInfo) => {
    toast("Delete Content", {
      description: `Are you sure you want to delete "${content.fileName}"?`,
      action: (
        <Button variant="destructive" size="sm" onClick={() => {
          // Implement delete logic here
          toast("Content Deleted", {
            description: `"${content.fileName}" has been deleted.`,
          })
        }} >
          Delete
        </Button>
      ),
    })
  }
  const truncateFileName = (name: string) => {
    return name.length > 20 ? name.slice(0, 20) + "..." : name;
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead className="hidden md:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((item) => (
          <TableRow key={item.fileId} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <TableCell className="font-medium">
              {/* On clicking the file name, call the handleVerificationRedirect */}
              <Button variant="link" className="p-0" onClick={() => handleVerificationRedirect(item)}>
               {truncateFileName(item.fileName || "")}
              </Button>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center space-x-1">
                {getContentTypeIcon(item.fileType)}
                <span className="capitalize">{item.fileType}</span>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{formatDate(item.$createdAt)}</TableCell>
            <TableCell >
              <Badge variant="secondary" className={`${getStatusColor(item)} px-2 py-1 rounded-full text-xs font-semibold`}>
                {getStatusText(item)}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {/* Show "View" if verified, otherwise show "Verify" */}
                  {item.verified ? (
                    <DropdownMenuItem onClick={() => handleVerificationRedirect(item)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleVerificationRedirect(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Verify</span>
                    </DropdownMenuItem>
                  )}
                  {/* Only show "Delete" if not verified */}
                  {!item.verified && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
