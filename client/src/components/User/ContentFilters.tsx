import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContentFiltersProps } from '@/lib/frontend-types'

export default function ContentFilters({
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  sortBy,
  setSortBy
}: ContentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Statuses</SelectItem>
          <SelectItem value="Verified">Verified</SelectItem>
          <SelectItem value="Not Verified">Not Verified</SelectItem>
          <SelectItem value="Tampered">Tampered</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Types</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
          <SelectItem value="image">Images</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'Date' | 'Status' | 'Title')}>
        <SelectTrigger className="w-full sm:w-[180px]">
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