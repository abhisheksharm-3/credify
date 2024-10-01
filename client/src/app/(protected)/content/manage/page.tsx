"use client"
import React, { useState, useMemo} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search } from 'lucide-react'
import LoggedInLayout from '@/components/Layout/LoggedInLayout'
import ContentTable from '@/components/User/ContentTable'
import ContentFilters from '@/components/User/ContentFilters'
import ContentPagination from '@/components/User/ContentPagination'
import ContentInsights from '@/components/User/ContentInsights'
import { UploadVideoDialog } from '@/components/User/UploadVideoDialog'
import { useFiles } from '@/hooks/useFiles'

export default function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterType, setFilterType] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'Date' | 'Status' | 'Title'>('Date')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { files,verifiedCount,tamperedCount,unverifiedCount } = useFiles();

  const filteredFiles = useMemo(() => {
    return files.filter(file =>
      (file.fileName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'All' ||
        (filterStatus === 'Verified' && file.verified && !file.tampered) ||
        (filterStatus === 'Not Verified' && !file.verified && !file.tampered) ||
        (filterStatus === 'Tampered' && file.tampered)
      ) &&
      (filterType === 'All' || file.fileType === filterType)
    )
  }, [searchTerm, filterStatus, filterType, files])

  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      if (sortBy === 'Date') {
        if (!a.$createdAt || !b.$createdAt) return 0; // handle undefined $createdAt
        return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      }
      if (sortBy === 'Status') {
        if (a.verified && !a.tampered) return -1;
        if (!a.verified && !a.tampered) return 1;
        if (a.tampered) return 1;
        if (b.tampered) return -1;
        return 0;
      }
      if (sortBy === 'Title') {
        return (a.fileName || '').localeCompare(b.fileName || '');
      }
      return 0;
    });
  }, [filteredFiles, sortBy]);

  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedFiles.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedFiles, currentPage])

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
          <UploadVideoDialog />
        </div>
        <Card className="overflow-hidden">
          <ContentTable
            files={paginatedFiles}
          />
        </Card>
        <ContentPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={sortedFiles.length}
          itemsPerPage={itemsPerPage}
        />
        <ContentInsights verifiedCount={verifiedCount} tamperedCount={tamperedCount} unverifiedCount={unverifiedCount} />
      </div>
    </LoggedInLayout>
  )
}
