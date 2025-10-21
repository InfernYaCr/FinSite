"use client"

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/src/lib/utils'

type SheetContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

export interface SheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Sheet({ children, open, defaultOpen, onOpenChange }: SheetProps) {
  const [internal, setInternal] = React.useState<boolean>(!!defaultOpen)
  const isControlled = open !== undefined
  const value = isControlled ? !!open : internal

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternal(v)
      onOpenChange?.(v)
    },
    [isControlled, onOpenChange],
  )

  return <SheetContext.Provider value={{ open: value, setOpen }}>{children}</SheetContext.Provider>
}

function SheetTrigger({ asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(SheetContext)!
  if (asChild) {
    return React.cloneElement(props.children as any, {
      onClick: (e: any) => {
        props.onClick?.(e)
        ctx.setOpen(true)
      },
    })
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        props.onClick?.(e)
        ctx.setOpen(true)
      }}
      {...props}
    />
  )
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

function SheetOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in',
        className,
      )}
      {...props}
    />
  )
}

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

function SheetContent({ className, side = 'right', children, ...props }: SheetContentProps) {
  const ctx = React.useContext(SheetContext)!
  if (!ctx.open) return null

  const sideClasses: Record<NonNullable<SheetContentProps['side']>, string> = {
    right: 'right-0 h-full w-3/4 max-w-sm translate-x-0',
    left: 'left-0 h-full w-3/4 max-w-sm translate-x-0',
    top: 'top-0 w-full translate-y-0',
    bottom: 'bottom-0 w-full translate-y-0',
  }

  return (
    <SheetPortal>
      <SheetOverlay onClick={() => ctx.setOpen(false)} />
      <div className="fixed inset-0 z-50 flex">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'fixed z-50 border bg-background p-6 shadow-lg outline-none',
            side === 'right' && 'inset-y-0 right-0 rounded-l-lg',
            side === 'left' && 'inset-y-0 left-0 rounded-r-lg',
            side === 'top' && 'inset-x-0 top-0 rounded-b-lg',
            side === 'bottom' && 'inset-x-0 bottom-0 rounded-t-lg',
            'w-full sm:w-auto',
            sideClasses[side],
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function SheetClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SheetContext)!
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        props.onClick?.(e)
        ctx.setOpen(false)
      }}
      {...props}
    />
  )
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose }
