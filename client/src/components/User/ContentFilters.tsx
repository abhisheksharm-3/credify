import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContentFiltersProps {
  filterStatus: string
  setFilterStatus: (status: string) => void
  filterType: string
  setFilterType: (type: string) => void
  sortBy: 'Date' | 'Status' | 'Title'
  setSortBy: (sortBy: 'Date' | 'Status' | 'Title') => void
}

export default function ContentFilters({
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  sortBy,
  setSortBy
}: ContentFiltersProps) {
  return (
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
  )
}