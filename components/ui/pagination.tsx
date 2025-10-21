import * as React from 'react'
import { cn } from '@/src/lib/utils'

function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav role="navigation" aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />
}

function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} {...props} />
}

function PaginationItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />
}

export interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground',
        isActive && 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink
      className={cn('px-3 w-auto', className)}
      {...props}
    />
  )
}

function PaginationNext({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink
      className={cn('px-3 w-auto', className)}
      {...props}
    />
  )
}

function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('inline-flex h-9 w-9 items-center justify-center', className)} {...props}>
      …
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
