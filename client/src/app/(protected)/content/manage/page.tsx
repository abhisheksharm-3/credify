"use client"

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Search } from 'lucide-react'
import LoggedInLayout from '@/components/Layout/LoggedInLayout'
import ContentTable from '@/components/User/ContentTable'
import ContentFilters from '@/components/User/ContentFilters'
import ContentPagination from '@/components/User/ContentPagination'
import ContentInsights from '@/components/User/ContentInsights'
import ContentDetailsSheet from '@/components/User/ContentDetailsSheet'
import { toast } from 'sonner'
import { Content } from '@/lib/types'

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  const paginatedContent = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedContent.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedContent, currentPage])

  const handleAddNewContent = () => {
    toast.info("New Content",{
      description: "Feature coming soon: Add new content",
    })
  }

  const handleContentUpdate = (updatedContent: Content) => {
    // In a real application, you would update the content in your backend here
    toast.success("Content Updated",{
      description: `${updatedContent.title} has been successfully updated.`,
    })
    setSelectedContent(null)
    setIsEditing(false)
  }

  return (
    <LoggedInLayout className='min-h-screen flex flex-col justify-start'>
      <div className="container mx-auto p-6 space-y-8 rounded-lg">
        <header className="flex justify-between items-center flex-wrap gap-4">
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
          <ContentFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddNewContent}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Content
          </Button>
        </div>

        <Card className="overflow-hidden">
          <ContentTable
            content={paginatedContent}
            onViewContent={setSelectedContent}
            onEditContent={(content) => {
              setSelectedContent(content)
              setIsEditing(true)
            }}
          />
        </Card>

        <ContentPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={sortedContent.length}
          itemsPerPage={itemsPerPage}
        />

        <ContentInsights content={sortedContent} />

        <ContentDetailsSheet
          content={selectedContent}
          isEditing={isEditing}
          onClose={() => {
            setSelectedContent(null)
            setIsEditing(false)
          }}
          onEdit={() => setIsEditing(true)}
          onSave={handleContentUpdate}
        />
      </div>
    </LoggedInLayout>
  )
}