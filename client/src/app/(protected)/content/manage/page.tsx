"use client"

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Edit, Eye, Image as ImageIcon, MoreVertical, Plus, Search, Trash2, Video } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LoggedInLayout from '@/components/Layout/LoggedInLayout'

interface Content {
  id: number
  title: string
  type: 'video' | 'image'
  uploadDate: string
  status: 'Published' | 'Draft' | 'Under Review'
  creator: string
  duration?: string
  dimensions?: string
  description: string
}

const mockContent: Content[] = [
  { id: 1, title: 'Summer Vacation Video', type: 'video', uploadDate: '2023-05-15', status: 'Published', creator: 'John Doe', duration: '2:30', description: 'A fun video of our summer vacation.' },
  { id: 2, title: 'Product Showcase', type: 'image', uploadDate: '2023-05-14', status: 'Draft', creator: 'Jane Smith', dimensions: '3000x2000', description: 'High-quality image of our latest product.' },
  { id: 3, title: 'Company Event Highlights', type: 'video', uploadDate: '2023-05-13', status: 'Under Review', creator: 'Alice Johnson', duration: '4:15', description: 'Highlights from our annual company event.' },
  { id: 4, title: 'New Office Space', type: 'image', uploadDate: '2023-05-12', status: 'Published', creator: 'Bob Brown', dimensions: '2400x1600', description: 'Photos of our newly renovated office space.' },
]

export default function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterType, setFilterType] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'Date' | 'Status' | 'Title'>('Date')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const filteredContent = useMemo(() => {
    return mockContent.filter(content => 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'All' || content.status === filterStatus) &&
      (filterType === 'All' || content.type === filterType)
    )
  }, [searchTerm, filterStatus, filterType])

  const sortedContent = useMemo(() => {
    return [...filteredContent].sort((a, b) => {
      if (sortBy === 'Date') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      if (sortBy === 'Status') return a.status.localeCompare(b.status)
      if (sortBy === 'Title') return a.title.localeCompare(b.title)
      return 0
    })
  }, [filteredContent, sortBy])

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

  return (
    <LoggedInLayout className='min-h-screen flex flex-col justify-start'>
      <div className="container mx-auto p-6 space-y-8 rounded-lg">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </header>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex space-x-4 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="image">Images</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'Date' | 'Status' | 'Title')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Date">Date</SelectItem>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Content
          </Button>
        </div>

        <Card className="overflow-hidden">
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
              {sortedContent.map((content) => (
                <TableRow key={content.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <TableCell className="font-medium">
                    <Button variant="link" className="p-0" onClick={() => {
                      setSelectedContent(content)
                      setIsEditing(false)
                    }}>
                      {content.title}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getContentTypeIcon(content.type)}
                      <span className="capitalize">{content.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{content.uploadDate}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getStatusColor(content.status)} px-2 py-1 rounded-full text-xs font-semibold`}>
                      {content.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{content.creator}</TableCell>
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedContent(content)
                          setIsEditing(false)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedContent(content)
                          setIsEditing(true)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
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
        </Card>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <Card>
          <CardHeader>
            <CardTitle>Content Insights</CardTitle>
            <CardDescription>Overview of your content performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              <span>You have 2 draft items that need to be reviewed before publishing.</span>
            </div>
          </CardContent>
        </Card>

        {selectedContent && (
          <Sheet open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
            <SheetContent className="sm:max-w-[540px]">
              <SheetHeader>
                <SheetTitle>{isEditing ? 'Edit Content' : 'Content Details'}</SheetTitle>
                <SheetDescription>
                  {isEditing ? 'Make changes to your content here.' : 'View detailed information about your content.'}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={selectedContent.title}
                    readOnly={!isEditing}
                    className={isEditing ? '' : 'bg-muted'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={selectedContent.description}
                    readOnly={!isEditing}
                    className={isEditing ? '' : 'bg-muted'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={selectedContent.type}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select defaultValue={selectedContent.status}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="status"
                      value={selectedContent.status}
                      readOnly
                      className="bg-muted"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creator">Creator</Label>
                  <Input
                    id="creator"
                    value={selectedContent.creator}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploadDate">Upload Date</Label>
                  <Input
                    id="uploadDate"
                    value={selectedContent.uploadDate}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                {selectedContent.type === 'video' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={selectedContent.duration}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                )}
                {selectedContent.type === 'image' && (
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={selectedContent.dimensions}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
              <SheetFooter className="mt-6">
  {isEditing ? (
    <>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
    </>
  ) : (
    <Button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
      Edit
    </Button>
  )}
</SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </LoggedInLayout>
  )
}