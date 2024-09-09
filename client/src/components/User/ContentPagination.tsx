import React from 'react'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface ContentPaginationProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

export default function ContentPagination({
  currentPage,
  setCurrentPage,
  totalItems,
  itemsPerPage
}: ContentPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) setCurrentPage(currentPage - 1)
            }}
          />
        </PaginationItem>
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1
          if (page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <PaginationEllipsis key={page} />
          }
          return null
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) setCurrentPage(currentPage + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}