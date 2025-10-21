"use client"

import * as React from 'react'
import { cn } from '@/src/lib/utils'

type TabsContext = {
  value: string | undefined
  setValue: (v: string) => void
}

const TabsCtx = React.createContext<TabsContext | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Tabs({ value, defaultValue, onValueChange, className, ...props }: TabsProps) {
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v)
      onValueChange?.(v)
    },
    [isControlled, onValueChange],
  )

  return (
    <TabsCtx.Provider value={{ value: current, setValue }}>
      <div className={cn('w-full', className)} {...props} />
    </TabsCtx.Provider>
  )
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsCtx)
  const isActive = ctx?.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => ctx?.setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({ className, value, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsCtx)
  const isActive = ctx?.value === value
  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={cn('mt-2 focus-visible:outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
