"use client"
import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Search, BarChart2 } from 'lucide-react'
import LoggedInLayout from '@/components/Layout/LoggedInLayout'
import ContentTable from '@/components/User/ContentTable'
import ContentFilters from '@/components/User/ContentFilters'
import ContentPagination from '@/components/User/ContentPagination'
import ContentInsights from '@/components/User/ContentInsights'
import UploadVideoDialog from '@/components/User/UploadVideoDialog'
import { useFiles } from '@/hooks/useFiles'

export default function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterType, setFilterType] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'Date' | 'Status' | 'Title'>('Date')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { files, verifiedCount, tamperedCount, unverifiedCount } = useFiles();

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Search filter
      const matchesSearch = (file.fileName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'All' ||
        (filterStatus === 'Verified' && file.verified && !file.tampered) ||
        (filterStatus === 'Not Verified' && !file.verified && !file.tampered) ||
        (filterStatus === 'Tampered' && file.tampered);
      
      // Type filter - convert both to lowercase for case-insensitive comparison
      const matchesType = filterType === 'All' || 
    (filterType.toLowerCase() === 'image' && file.fileType?.toLowerCase().startsWith('image/')) ||
    (filterType.toLowerCase() === 'video' && file.fileType?.toLowerCase().startsWith('video/')) ||
    file.fileType?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, filterStatus, filterType, files]);

  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      if (sortBy === 'Date') {
        if (!a.$createdAt || !b.$createdAt) return 0;
        return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      }
      if (sortBy === 'Status') {
        if (a.verified && !a.tampered) return -1;
        if (b.verified && !b.tampered) return 1;
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
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedFiles.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedFiles, currentPage]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  return (
    <LoggedInLayout className='min-h-screen flex flex-col justify-start bg-gray-50 dark:bg-gray-900'>
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-col space-y-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Content Management</CardTitle>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <UploadVideoDialog />
              <Input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-gray-100 dark:bg-gray-700"
              />
              <Button variant="outline" className="w-full sm:w-auto bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-4 mb-6">
              <ContentFilters
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterType={filterType}
                setFilterType={setFilterType}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
            <Card className="overflow-x-auto bg-white border-border dark:border-white/20 border-[1px] dark:bg-gray-800 shadow-sm">
              <ContentTable files={paginatedFiles} />
            </Card>
            <div className="mt-6">
              <ContentPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={sortedFiles.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl">Content Insights</CardTitle>
            </div>
            <CardDescription>Overview of your content status</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentInsights
              verifiedCount={verifiedCount}
              tamperedCount={tamperedCount}
              unverifiedCount={unverifiedCount}
            />
          </CardContent>
        </Card>
      </div>
    </LoggedInLayout>
  );
}