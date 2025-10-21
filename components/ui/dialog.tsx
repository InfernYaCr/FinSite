"use client"

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/src/lib/utils'

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Dialog({ children, open, defaultOpen, onOpenChange }: DialogProps) {
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

  return <DialogContext.Provider value={{ open: value, setOpen }}>{children}</DialogContext.Provider>
}

function DialogTrigger({ asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(DialogContext)!
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

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DialogContext)!
  if (!ctx.open) return null
  return (
    <DialogPortal>
      <DialogOverlay onClick={() => ctx.setOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function DialogClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(DialogContext)!
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

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
