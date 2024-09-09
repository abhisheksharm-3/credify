import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Eye, Image as ImageIcon, MoreVertical, Trash2, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Content } from '@/lib/types'

interface ContentTableProps {
  content: Content[]
  onViewContent: (content: Content) => void
  onEditContent: (content: Content) => void
}

export default function ContentTable({ content, onViewContent, onEditContent }: ContentTableProps) {

  const getStatusColor = (status: Content['status']) => {
    switch (status) {
      case 'Published': return 'bg-green-500 text-white'
      case 'Draft': return 'bg-yellow-500 text-black'
      case 'Under Review': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getContentTypeIcon = (type: Content['type']) => {
    return type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />
  }

  const handleDelete = (content: Content) => {
    toast("Delete Content",{
      description: `Are you sure you want to delete "${content.title}"?`,
      action: (
        <Button variant="destructive" size="sm" onClick={() => {
          // Implement delete logic here
          toast("Content Deleted", {
            description: `"${content.title}" has been deleted.`,
          })
        }}>
          Delete
        </Button>
      ),
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {content.map((item) => (
          <TableRow key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <TableCell className="font-medium">
              <Button variant="link" className="p-0" onClick={() => onViewContent(item)}>
                {item.title}
              </Button>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                {getContentTypeIcon(item.type)}
                <span className="capitalize">{item.type}</span>
              </div>
            </TableCell>
            <TableCell>{item.uploadDate}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={`${getStatusColor(item.status)} px-2 py-1 rounded-full text-xs font-semibold`}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>{item.creator}</TableCell>
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
                  <DropdownMenuItem onClick={() => onViewContent(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditContent(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}