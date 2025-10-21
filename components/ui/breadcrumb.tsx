import * as React from 'react'
import { cn } from '@/src/lib/utils'

function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={cn('w-full', className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  return <ol className={cn('flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground', className)} {...props} />
}

function BreadcrumbItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />
}

function BreadcrumbLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn('transition-colors hover:text-foreground', className)} {...props} />
}

function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span aria-current="page" className={cn('font-normal text-foreground', className)} {...props} />
}

function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span role="presentation" aria-hidden="true" className={cn('text-muted-foreground/70', className)} {...props}>
      /
    </span>
  )
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator }
