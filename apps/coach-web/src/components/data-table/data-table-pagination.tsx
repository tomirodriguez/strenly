import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDataTableContext } from './data-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export function DataTablePagination() {
  const { table, totalCount, pageIndex, pageSize, onPageChange } = useDataTableContext()

  const pageCount = table.getPageCount()

  const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount)

  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1

  const handlePageSizeChange = (value: string | null) => {
    if (!value) return
    const newPageSize = Number.parseInt(value, 10)
    onPageChange(0, newPageSize)
  }

  const handlePreviousPage = () => {
    if (canPreviousPage) {
      onPageChange(pageIndex - 1, pageSize)
    }
  }

  const handleNextPage = () => {
    if (canNextPage) {
      onPageChange(pageIndex + 1, pageSize)
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page, pageSize)
  }

  const renderPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7

    if (pageCount <= maxVisiblePages) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i)
      }
    } else {
      const leftSiblingIndex = Math.max(pageIndex - 1, 0)
      const rightSiblingIndex = Math.min(pageIndex + 1, pageCount - 1)

      const showLeftEllipsis = leftSiblingIndex > 1
      const showRightEllipsis = rightSiblingIndex < pageCount - 2

      pages.push(0)

      if (showLeftEllipsis) {
        pages.push('left-ellipsis')
      }

      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 0 && i !== pageCount - 1) {
          pages.push(i)
        }
      }

      if (showRightEllipsis) {
        pages.push('right-ellipsis')
      }

      if (pageCount > 1) {
        pages.push(pageCount - 1)
      }
    }

    return pages.map((page) => {
      if (typeof page === 'string') {
        return (
          <span key={page} className="flex h-9 w-9 items-center justify-center text-muted-foreground">
            ...
          </span>
        )
      }

      const isActive = page === pageIndex

      return (
        <Button
          key={page}
          variant={isActive ? 'outline' : 'ghost'}
          size="icon"
          onClick={() => handlePageClick(page)}
          disabled={isActive}
          className={isActive ? 'pointer-events-none' : ''}
        >
          {page + 1}
        </Button>
      )
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>
          Mostrando {startItem} a {endItem} de {totalCount} resultados
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Elementos por pagina</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePreviousPage} disabled={!canPreviousPage}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {renderPageNumbers()}

          <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={!canNextPage}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
