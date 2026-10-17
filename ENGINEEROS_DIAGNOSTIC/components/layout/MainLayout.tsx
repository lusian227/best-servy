// src/components/layout/MainLayout.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
