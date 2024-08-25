import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AlertCircle, CheckCircle2, Clock, Eye, Image as ImageIcon, RefreshCw, Search, Trash2, Upload, Video, XCircle } from 'lucide-react'

// Types
type ContentType = 'video' | 'image'
type ContentStatus = 'Verified' | 'Tampered' | 'Pending' | 'In Progress'

interface Content {
  id: number
  title: string
  type: ContentType
  uploadDate: string
  status: ContentStatus
  lastVerified: string
  creator: string
  duration?: string
  resolution?: string
  dimensions?: string
  fileSize?: string
}

// Mock data
const mockContent: Content[] = [
  { id: 1, title: 'Video 1', type: 'video', uploadDate: '2023-05-15', status: 'Verified', lastVerified: '2023-05-16', creator: 'John Doe', duration: '2:30', resolution: '1920x1080' },
  { id: 2, title: 'Image 1', type: 'image', uploadDate: '2023-05-14', status: 'Tampered', lastVerified: '2023-05-15', creator: 'Jane Smith', dimensions: '3000x2000', fileSize: '5.2 MB' },
  { id: 3, title: 'Video 2', type: 'video', uploadDate: '2023-05-13', status: 'Pending', lastVerified: '-', creator: 'Alice Johnson', duration: '4:15', resolution: '1280x720' },
  { id: 4, title: 'Image 2', type: 'image', uploadDate: '2023-05-12', status: 'In Progress', lastVerified: '2023-05-13', creator: 'Bob Brown', dimensions: '2400x1600', fileSize: '3.8 MB' },
]

const VerificationStatus: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'All'>('All')
  const [filterType, setFilterType] = useState<ContentType | 'All'>('All')
  const [sortBy, setSortBy] = useState<'Date' | 'Status' | 'Title'>('Date')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

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

  const getStatusIcon = (status: ContentStatus) => {
    switch (status) {
      case 'Verified': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'Tampered': return <XCircle className="w-4 h-4 text-red-500" />
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'In Progress': return <RefreshCw className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800'
      case 'Tampered': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
    }
  }

  const getContentTypeIcon = (type: ContentType) => {
    return type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />
  }

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Verification Status</h1>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button variant="outline" className="whitespace-nowrap">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-lg shadow-sm space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={filterStatus} onValueChange={(value: string) => setFilterStatus(value as ContentStatus | 'All')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Tampered">Tampered</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(value: string) => setFilterType(value as ContentType | 'All')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="image">Images</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'Date' | 'Status' | 'Title')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Date">Date</SelectItem>
              <SelectItem value="Status">Status</SelectItem>
              <SelectItem value="Title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full md:w-auto">
          <Upload className="w-4 h-4 mr-2" />
          Upload New Content
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Verified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContent.map((content) => (
              <TableRow key={content.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="link" className="p-0" onClick={() => setSelectedContent(content)}>
                        {content.title}
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Content Details: {content.title}</SheetTitle>
                        <SheetDescription>
                          Detailed information about the content and its verification status.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div>
                          <h3 className="font-semibold">Content Type</h3>
                          <p className="capitalize">{content.type}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Creator</h3>
                          <p>{content.creator}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Upload Date</h3>
                          <p>{content.uploadDate}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Status</h3>
                          <Badge variant="secondary" className={getStatusColor(content.status)}>
                            {getStatusIcon(content.status)}
                            <span className="ml-1">{content.status}</span>
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-semibold">Last Verified</h3>
                          <p>{content.lastVerified}</p>
                        </div>
                        {content.type === 'video' ? (
                          <>
                            <div>
                              <h3 className="font-semibold">Duration</h3>
                              <p>{content.duration}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Resolution</h3>
                              <p>{content.resolution}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h3 className="font-semibold">Dimensions</h3>
                              <p>{content.dimensions}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">File Size</h3>
                              <p>{content.fileSize}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <h3 className="font-semibold">Verification History</h3>
                          <p>Detailed verification history would be displayed here.</p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {getContentTypeIcon(content.type)}
                    <span className="capitalize">{content.type}</span>
                  </div>
                </TableCell>
                <TableCell>{content.uploadDate}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(content.status)}>
                    {getStatusIcon(content.status)}
                    <span className="ml-1">{content.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>{content.lastVerified}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Re-Verify
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
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
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
          <CardDescription>Content requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Image 1 has been flagged as potentially tampered. Please review immediately.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerificationStatus